import type { RequestHandler } from '@sveltejs/kit';
import { api } from '$api/apiRouter';

const handler: RequestHandler = async (event) => {
    return api.handle(event);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;