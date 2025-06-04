import type { LayoutServerLoad } from './$types';

// @ts-ignore
export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user,
        session: locals.session,
    };
};
