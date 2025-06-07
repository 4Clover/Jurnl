<<<<<<<< HEAD:src/routes/(Homepage)/+layout.server.ts
﻿import type { LayoutServerLoad } from './$types';

// @ts-ignore
export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user,
        session: locals.session,
    };
};
========
﻿import type { LayoutServerLoad } from './$types';

// @ts-ignore
export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user,
        session: locals.session,
    };
};
>>>>>>>> refs/remotes/origin/presentation-AUTH-WORKING:src/routes/(home)/+layout.server.ts
