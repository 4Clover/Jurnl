import type { RequestEvent } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import type { Model, Document, RootFilterQuery } from 'mongoose';
import { z } from 'zod';
import { logger } from '$lib/server/logger';
import { getContext } from '$lib/server/context';

export interface CrudOptions<T extends Document> {
    model: Model<T>;
    validateCreate?: z.ZodSchema;
    validateUpdate?: z.ZodSchema;
    canRead?: (doc: T, event: RequestEvent) => boolean | Promise<boolean>;
    canWrite?: (doc: T, event: RequestEvent) => boolean | Promise<boolean>;
    beforeCreate?: (data: unknown, event: RequestEvent) => Promise<unknown>;
    afterCreate?: (doc: T, event: RequestEvent) => Promise<void>;
    beforeUpdate?: (
        doc: T,
        data: unknown,
        event: RequestEvent,
    ) => Promise<unknown>;
    afterUpdate?: (doc: T, event: RequestEvent) => Promise<void>;
    beforeDelete?: (doc: T, event: RequestEvent) => Promise<void>;
    afterDelete?: (doc: T, event: RequestEvent) => Promise<void>;
}

export class CrudService<T extends Document> {
    private serviceName: string;

    constructor(private options: CrudOptions<T>) {
        this.serviceName = this.options.model.modelName || 'Unknown';
    }

    private getLogger() {
        const context = getContext();
        return logger.child({
            ...context,
            service: this.serviceName,
        });
    }

    async list(event: RequestEvent, filter: RootFilterQuery<T> = {}) {
        const log = this.getLogger();
        const timer = log.startTimer();

        try {
            log.debug(`Listing ${this.serviceName} resources`, { filter });

            const docs = await this.options.model.find(filter).lean();
            const readable = [];

            for (const doc of docs) {
                const mongoDoc = new this.options.model(doc);
                if (
                    !this.options.canRead ||
                    (await this.options.canRead(mongoDoc as T, event))
                ) {
                    readable.push(mongoDoc.toJSON());
                }
            }

            timer.end(
                `Listed ${readable.length} ${this.serviceName} resources`,
            );
            return json(readable);
        } catch (err) {
            log.error(`Failed to list ${this.serviceName} resources`, err, {
                filter,
            });
            error(500, 'Failed to fetch resources');
        }
    }

    async get(event: RequestEvent, id: string) {
        const log = this.getLogger();

        try {
            log.debug(`Getting ${this.serviceName} resource`, { id });

            const doc = await this.options.model.findById(id);

            if (!doc) {
                log.warn(`${this.serviceName} resource not found`, { id });
                error(404, 'Resource not found');
            }

            if (
                this.options.canRead &&
                !(await this.options.canRead(doc, event))
            ) {
                log.warn(`Access denied to ${this.serviceName} resource`, {
                    id,
                    userId: event.locals.user?.id,
                });
                error(403, 'Access denied');
            }

            log.debug(`Retrieved ${this.serviceName} resource`, { id });
            return json(doc.toJSON());
        } catch (err: unknown) {
            if (err instanceof Error && 'status' in err) throw err;
            log.error(`Failed to get ${this.serviceName} resource`, err, {
                id,
            });
            error(500, 'Failed to fetch resource');
        }
    }

    async create(event: RequestEvent) {
        const log = this.getLogger();
        const timer = log.startTimer();

        try {
            log.debug(`Creating ${this.serviceName} resource`);

            const body = (await event.request.json()) as unknown;

            if (this.options.validateCreate) {
                const result = this.options.validateCreate.safeParse(body);
                if (!result.success) {
                    log.warn(
                        `Validation failed for ${this.serviceName} creation`,
                        {
                            errors: result.error.errors,
                        },
                    );
                    error(400, {
                        message: 'Validation failed',
                        details: { errors: result.error.errors },
                    });
                }
            }

            let data = body;
            if (this.options.beforeCreate) {
                data = await this.options.beforeCreate(data, event);
            }

            const doc = await this.options.model.create(data);

            if (this.options.afterCreate) {
                await this.options.afterCreate(doc, event);
            }

            timer.end(`Created ${this.serviceName} resource`, {
                id: (doc as any)._id?.toString(),
            });
            return json(doc.toJSON(), { status: 201 });
        } catch (err: unknown) {
            if (err instanceof Error && 'status' in err) throw err;
            log.error(`Failed to create ${this.serviceName} resource`, err);
            error(500, 'Failed to create resource');
        }
    }

    async update(event: RequestEvent, id: string) {
        const log = this.getLogger();
        const timer = log.startTimer();

        try {
            log.debug(`Updating ${this.serviceName} resource`, { id });

            const doc = await this.options.model.findById(id);

            if (!doc) {
                log.warn(`${this.serviceName} resource not found for update`, {
                    id,
                });
                error(404, 'Resource not found');
            }

            if (
                this.options.canWrite &&
                !(await this.options.canWrite(doc, event))
            ) {
                log.warn(
                    `Access denied to update ${this.serviceName} resource`,
                    {
                        id,
                        userId: event.locals.user?.id,
                    },
                );
                error(403, 'Access denied');
            }

            const body = (await event.request.json()) as unknown;

            if (this.options.validateUpdate) {
                const result = this.options.validateUpdate.safeParse(body);
                if (!result.success) {
                    log.warn(
                        `Validation failed for ${this.serviceName} update`,
                        {
                            id,
                            errors: result.error.errors,
                        },
                    );
                    error(400, {
                        message: 'Validation failed',
                        details: { errors: result.error.errors },
                    });
                }
            }

            let data = body;
            if (this.options.beforeUpdate) {
                data = await this.options.beforeUpdate(doc, data, event);
            }

            Object.assign(doc, data);
            await doc.save();

            if (this.options.afterUpdate) {
                await this.options.afterUpdate(doc, event);
            }

            timer.end(`Updated ${this.serviceName} resource`, { id });
            return json(doc.toJSON());
        } catch (err: unknown) {
            if (err instanceof Error && 'status' in err) throw err;
            log.error(`Failed to update ${this.serviceName} resource`, err, {
                id,
            });
            error(500, 'Failed to update resource');
        }
    }

    async delete(event: RequestEvent, id: string) {
        const log = this.getLogger();
        const timer = log.startTimer();

        try {
            log.debug(`Deleting ${this.serviceName} resource`, { id });

            const doc = await this.options.model.findById(id);

            if (!doc) {
                log.warn(
                    `${this.serviceName} resource not found for deletion`,
                    { id },
                );
                error(404, 'Resource not found');
            }

            if (
                this.options.canWrite &&
                !(await this.options.canWrite(doc, event))
            ) {
                log.warn(
                    `Access denied to delete ${this.serviceName} resource`,
                    {
                        id,
                        userId: event.locals.user?.id,
                    },
                );
                error(403, 'Access denied');
            }

            if (this.options.beforeDelete) {
                await this.options.beforeDelete(doc, event);
            }

            await this.options.model.findByIdAndDelete(id);

            if (this.options.afterDelete) {
                await this.options.afterDelete(doc, event);
            }

            timer.end(`Deleted ${this.serviceName} resource`, { id });
            return new Response(null, { status: 204 });
        } catch (err: unknown) {
            if (err instanceof Error && 'status' in err) throw err;
            log.error(`Failed to delete ${this.serviceName} resource`, err, {
                id,
            });
            error(500, 'Failed to delete resource');
        }
    }
}
