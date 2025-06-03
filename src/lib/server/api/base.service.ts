import type { RequestEvent } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import type { Model, Document } from 'mongoose';
import { z } from 'zod';

export interface CrudOptions<T extends Document> {
    model: Model<T>;
    validateCreate?: z.ZodSchema;
    validateUpdate?: z.ZodSchema;
    canRead?: (doc: T, event: RequestEvent) => boolean | Promise<boolean>;
    canWrite?: (doc: T, event: RequestEvent) => boolean | Promise<boolean>;
    beforeCreate?: (data: any, event: RequestEvent) => Promise<any>;
    afterCreate?: (doc: T, event: RequestEvent) => Promise<void>;
    beforeUpdate?: (doc: T, data: any, event: RequestEvent) => Promise<any>;
    afterUpdate?: (doc: T, event: RequestEvent) => Promise<void>;
    beforeDelete?: (doc: T, event: RequestEvent) => Promise<void>;
    afterDelete?: (doc: T, event: RequestEvent) => Promise<void>;
}

export class CrudService<T extends Document> {
    constructor(private options: CrudOptions<T>) {}

    async list(event: RequestEvent, filter: any = {}) {
        try {
            const docs = await this.options.model.find(filter).lean();
            const readable = [];

            for (const doc of docs) {
                const mongoDoc = new this.options.model(doc);
                if (!this.options.canRead || await this.options.canRead(mongoDoc as T, event)) {
                    readable.push(mongoDoc.toJSON());
                }
            }

            return json(readable);
        } catch (err) {
            console.error('Error in list:', err);
            throw error(500, 'Failed to fetch resources');
        }
    }

    async get(event: RequestEvent, id: string) {
        try {
            const doc = await this.options.model.findById(id);

            if (!doc) {
                error(404, 'Resource not found');
            }

            if (this.options.canRead && !await this.options.canRead(doc, event)) {
                error(403, 'Access denied');
            }

            return json(doc.toJSON());
        } catch (err: any) {
            if (err.status) throw err;
            console.error('Error in get:', err);
            throw error(500, 'Failed to fetch resource');
        }
    }

    async create(event: RequestEvent) {
        try {
            const body = await event.request.json();

            if (this.options.validateCreate) {
                const result = this.options.validateCreate.safeParse(body);
                if (!result.success) {
                    error(400, {
                        message: 'Validation failed',
                        //@ts-ignore
                        errors: result.error.flatten()
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

            return json(doc.toJSON(), { status: 201 });
        } catch (err: any) {
            if (err.status) throw err;
            console.error('Error in create:', err);
            throw error(500, 'Failed to create resource');
        }
    }

    async update(event: RequestEvent, id: string) {
        try {
            const doc = await this.options.model.findById(id);

            if (!doc) {
                error(404, 'Resource not found');
            }

            if (this.options.canWrite && !await this.options.canWrite(doc, event)) {
                error(403, 'Access denied');
            }

            const body = await event.request.json();

            if (this.options.validateUpdate) {
                const result = this.options.validateUpdate.safeParse(body);
                if (!result.success) {
                    error(400, {
                        message: 'Validation failed',
                        //@ts-ignore
                        errors: result.error.flatten()
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

            return json(doc.toJSON());
        } catch (err: any) {
            if (err.status) throw err;
            console.error('Error in update:', err);
            throw error(500, 'Failed to update resource');
        }
    }

    async delete(event: RequestEvent, id: string) {
        try {
            const doc = await this.options.model.findById(id);

            if (!doc) {
                error(404, 'Resource not found');
            }

            if (this.options.canWrite && !await this.options.canWrite(doc, event)) {
                error(403, 'Access denied');
            }

            if (this.options.beforeDelete) {
                await this.options.beforeDelete(doc, event);
            }

            await this.options.model.findByIdAndDelete(id);

            if (this.options.afterDelete) {
                await this.options.afterDelete(doc, event);
            }

            return new Response(null, { status: 204 });
        } catch (err: any) {
            if (err.status) throw err;
            console.error('Error in delete:', err);
            throw error(500, 'Failed to delete resource');
        }
    }
}