// This single file handles ALL API routes
import type { RequestHandler } from '@sveltejs/kit';
import { api } from '$api/apiRouter';

// Export a handler for each HTTP method
const handler: RequestHandler =
    (event) =>
        api.handle(event);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;