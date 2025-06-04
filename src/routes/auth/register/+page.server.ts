import { fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import connectToDatabase from '$lib/server/database';
import { type SerializableUser, User } from '$lib/server/database/schemas';
import { hashPassword } from '$lib/server/auth/password';
import { createSession } from '$lib/server/auth/sessionManager';
import { setSessionCookie } from '$lib/server/auth/cookies';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Zod schema for registration form validation
const registerSchema = z.object({
    username: z
        .string({ required_error: 'Username is required' })
        .min(3, { message: 'Username must be at least 3 characters' })
        .max(30, { message: 'Username cannot exceed 30 characters' })
        .trim(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' }),
    // email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
});

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        redirect(303, '/');
    }
    return {};
};

export const actions: Actions = {
    default: async (event) => {
        const { request, locals } = event;
        const formData = await request.formData();
        const rawData = Object.fromEntries(formData);
        // repopulate data
        const submittedDataForRepopulation = {
            username: rawData.username as string | undefined,
            // email: rawData.email as string | undefined,
        };

        let registrationSuccess = false;
        const redirectToPath: string | null = '/';

        try {
            await connectToDatabase();

            const parsedData = registerSchema.parse(rawData);
            const { username, password } = parsedData;
            // const email = parsedData.email || undefined; // Ensure empty string becomes undefined if schema allows

            // check if the username already exists
            const existingUserByUsername = await User.findOne({
                username,
            }).lean();
            if (existingUserByUsername) {
                return fail(409, {
                    // 409 = already exists
                    data: { username /*, email*/ }, // validated data
                    errors: {
                        username:
                            'Username already taken. Please choose another.',
                    },
                });
            }

            // Check if email already exists
            // if (email) {
            //     const existingUserByEmail = await User.findOne({ email }).lean();
            //     if (existingUserByEmail) {
            //         return fail(409, {
            //             data: { username, email },
            //             errors: { email: 'Email address is already in use.' }
            //         });
            //     }
            // }

            const hashedPassword = await hashPassword(password);

            const newUserDoc = new User({
                username,
                hashedPassword,
                // email,
            });
            await newUserDoc.save();

            // create the new user session
            const sessionDetails = await createSession(newUserDoc._id);

            setSessionCookie(
                event,
                sessionDetails.clientToken,
                sessionDetails.expiresAt,
            );

            // update locals with new user info
            locals.user = {
                id: newUserDoc._id.toString(),
                username: newUserDoc.username,
                email: newUserDoc.email, // undefined atp
                avatar_url: newUserDoc.avatar_url, // undefined atp
                createdAt: newUserDoc.createdAt.toISOString(),
                updatedAt: newUserDoc.updatedAt.toISOString(),
                close_friends: newUserDoc.close_friends,
                can_view_friends: newUserDoc.can_view_friends,
            };

            locals.session = {
                _id: sessionDetails.sessionId,
                userId: newUserDoc._id.toString(),
                expiresAt: sessionDetails.expiresAt.toISOString(),
            };

            registrationSuccess = true;
        } catch (error: any) {
            if (isRedirect(error)) {
                // should never be hit
                console.warn(
                    'Registration: A SvelteKit redirect was caught unexpectedly. Redirecting again:',
                    error,
                );
                redirect(303, redirectToPath);
            }

            if (error instanceof z.ZodError) {
                const validationErrors = fromZodError(error);
                console.warn(
                    'Registration validation error:',
                    validationErrors.toString(),
                );
                return fail(400, {
                    // 400 = validation errors
                    data: submittedDataForRepopulation,
                    errors: validationErrors.details.reduce(
                        (acc, curr) => {
                            if (curr.path && curr.path.length > 0) {
                                acc[curr.path[0] as string] = curr.message;
                            }
                            return acc;
                        },
                        {} as Record<string, string>,
                    ),
                });
            }

            // other unexpected errors (e.g., DB issues during createSession, etc.)
            console.error('Registration action error:', error);
            return fail(500, {
                data: submittedDataForRepopulation,
                errors: {
                    form: 'An unexpected error occurred during registration. Please try again later.',
                },
            });
        }

        // ---- SUCCESSFUL REGISTRATION CONDITIONS MET, REDIRECT WITHOUT CATCH ----
        if (registrationSuccess && redirectToPath) {
            console.log(
                'Registration successful, redirecting to:',
                redirectToPath,
            );
            throw redirect(303, redirectToPath);
        }

        console.warn(
            'Registration fallback reached, unhandled logic likely exists.',
        );
        return fail(500, {
            data: submittedDataForRepopulation,
            errors: {
                form: 'Registration process did not complete as expected.',
            },
        });
    },
} satisfies Actions;
