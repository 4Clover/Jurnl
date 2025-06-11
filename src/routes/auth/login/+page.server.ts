import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
    if (locals.user) {
        const intendedRedirect =
            url.searchParams.get('redirectTo') || '/landing';
        redirect(303, intendedRedirect);
    }
    return { redirectTo: url.searchParams.get('redirectTo') };
};
