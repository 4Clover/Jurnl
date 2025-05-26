import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import connectToDatabase from '$lib/server/database';
import { User } from '$lib/server/database/schemas';
import { verifyPassword } from '$lib/server/auth/password';
import { createSession, hashTokenForSessionId } from '$lib/server/auth/sessionManager';
import { setSessionCookie } from '$lib/server/auth/cookies';
import { z } from 'zod'; // validation
import { fromZodError } from 'zod-validation-error';

// Zod schema for login form validation
const loginSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }).trim(),
    password: z.string().min(1, { message: 'Password is required' }),
});

export const load: PageServerLoad = async ({ locals, url }) => {
    if (locals.user) {
        redirect(303, '/homepage');
    }
    return {
        redirectTo: url.searchParams.get('redirectTo')
    };
};

export const actions: Actions = {
    default: async (event) => {
        const { request, url } = event;
        await connectToDatabase();

        const formData = await request.formData();
        const rawData = Object.fromEntries(formData);

        try {
            const parsedData = loginSchema.parse({
                username: rawData.username,
                password: rawData.password
            });
            const { username, password } = parsedData;

            const user = await User.findOne({ username }).exec();

            if (!user || !user.hashedPassword) {
                return fail(400, {
                    data: { username },
                    errors: { form: 'Invalid username or password.' }
                });
            }

            const passwordMatch = await verifyPassword(user.hashedPassword, password);
            if (!passwordMatch) {
                return fail(400, {
                    data: { username },
                    errors: { form: 'Invalid username or password.' }
                });
            }

            // password is correct, create a new session
            const { clientToken, expiresAt } = await createSession(
                user._id,
            );

            setSessionCookie(event, clientToken, expiresAt);

            // update locals for the current request
            event.locals.user = user.toJSON() as App.Locals['user']; // Serialize for locals
            event.locals.session = { // serializable session for locals
                _id: await hashTokenForSessionId(clientToken),
                userId: user._id.toString(),
                expiresAt: Date.toString(),
            };


            const redirectTo = (rawData.redirectTo as string | undefined) || url.searchParams.get('redirectTo') || '/dashboard';
            redirect(303, redirectTo);

        } catch (error) {
            const submittedUsername = rawData.username as string | undefined;
            if (error instanceof z.ZodError) {
                const validationErrors = fromZodError(error);
                console.warn('Login validation error:', validationErrors.toString());
                return fail(400, {
                    data: { username: submittedUsername },
                    errors: validationErrors.details.reduce((acc, curr) => {
                        if (curr.path && curr.path.length > 0) {
                            acc[curr.path[0] as string] = curr.message;
                        }
                        return acc;
                    }, {} as Record<string, string>)
                });
            }

            console.error('Login action error:', error);
            return fail(500, {
                data: { username: submittedUsername },
                errors: { form: 'An unexpected server error occurred. Please try again.' }
            });
        }
    }
};