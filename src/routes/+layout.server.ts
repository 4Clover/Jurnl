import type { LayoutServerLoad } from './$types';
import {testApiRoutes} from '$lib/test-api';

export const load: LayoutServerLoad = async ({ locals }) => {
    await testApiRoutes();
    return {
        user: locals.user,
        session: locals.session,
    };
};
