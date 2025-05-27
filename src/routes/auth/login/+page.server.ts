import { fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import connectToDatabase from '$lib/server/database';
import { User } from '$lib/server/database/schemas';
import { verifyPassword } from '$lib/server/auth/password';
import { createSession } from '$lib/server/auth/sessionManager';
import { setSessionCookie } from '$lib/server/auth/cookies';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Zod schema for login form validation
const loginSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }).trim(),
    password: z.string().min(1, { message: 'Password is required' }),
});

export const load: PageServerLoad = async ({ locals, url }) => {
    if (locals.user) {
        const intendedRedirect =
            url.searchParams.get('redirectTo') || '/homepage';
        redirect(303, intendedRedirect);
    }
    return { redirectTo: url.searchParams.get('redirectTo') };
};

export const actions: Actions = {
    default: async (event) => {
        const { request, url, locals } = event;
        const formData = await request.formData();
        const rawData = Object.fromEntries(formData);
        const submittedUsername = rawData.username as string | undefined;

        let redirectToPath: string | null = '/homepage';
        let loginSuccess = false;

        try {
            await connectToDatabase(); // DB check as always

            const parsedData = loginSchema.parse({
                username: rawData.username,
                password: rawData.password,
            });
            const { username, password } = parsedData;

            const userDoc = await User.findOne({ username })
                .select('+hashedPassword')
                .exec();

            // --- LOGIN SUCCESSFUL (set cookies, locals, redirect) ---
            if (
                userDoc &&
                userDoc.hashedPassword &&
                (await verifyPassword(userDoc.hashedPassword, password))
            ) {
                // create session
                const sessionDetails = await createSession(userDoc._id);
                // set cookie given success
                setSessionCookie(
                    event,
                    sessionDetails.clientToken,
                    sessionDetails.expiresAt
                );
                // update locals
                locals.user = {
                    _id: userDoc._id.toString(),
                    username: userDoc.username,
                    email: userDoc.email,
                    avatarUrl: userDoc.avatarUrl,
                    createdAt: userDoc.createdAt.toISOString(),
                    updatedAt: userDoc.updatedAt.toISOString(),
                };
                locals.session = {
                    _id: sessionDetails.sessionId,
                    userId: userDoc._id.toString(),
                    expiresAt: sessionDetails.expiresAt.toISOString(),
                };
                // set the redirect path
                redirectToPath =
                    (rawData.redirectTo as string | undefined) ||
                    url.searchParams.get('redirectTo') ||
                    '/homepage';
                loginSuccess = true;
            } else {
                // credentials invalid
                return fail(400, {
                    data: { username: submittedUsername }, // repopulating form
                    errors: {
                        // displaying errors
                        username: 'Username is too short.', // Zod field-specific
                        password: 'Password is required.', // Zod field-specific
                        form: 'General form issue.',
                    },
                });
            }
        } catch (error: any) {
            // ZodErrors and unexpected errors
            // should never be hit
            if (isRedirect(error)) {
                console.warn(
                    'Registration: A SvelteKit redirect was caught unexpectedly. Redirecting again:',
                    error
                );
                redirect(303, redirectToPath);
            }

            if (error instanceof z.ZodError) {
                const validationErrors = fromZodError(error);
                console.warn(
                    'Login validation error:',
                    validationErrors.toString()
                );
                return fail(400, {
                    data: { username: submittedUsername },
                    errors: validationErrors.details.reduce(
                        (acc, curr) => {
                            if (curr.path && curr.path.length > 0) {
                                acc[curr.path[0] as string] = curr.message;
                            }
                            return acc;
                        },
                        {} as Record<string, string>
                    ),
                });
            }

            // other unexpected errors (e.g., DB issues during createSession, etc.)
            console.error('Login action - Unexpected error:', error);
            return fail(500, {
                data: { username: submittedUsername },
                errors: {
                    form: 'An unexpected server error occurred. Please try again.',
                },
            });
        }

        // ---- SUCCESSFUL LOGIN CONDITIONS MET, REDIRECT WITHOUT CATCH ----
        if (loginSuccess && redirectToPath) {
            console.log('Login successful, redirecting to:', redirectToPath);
            throw redirect(303, redirectToPath);
        }

        console.warn('Login fallback reached, unhandled logic likely exists.');
        return fail(500, {
            data: { username: submittedUsername },
            errors: { form: 'Login process did not complete as expected.' },
        });
    },
} satisfies Actions;
