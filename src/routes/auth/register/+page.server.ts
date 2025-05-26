import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import connectToDatabase from '$lib/server/database';
import { User } from '$lib/server/database/schemas';
import { hashPassword } from '$lib/server/auth/password';
import { createSession } from '$lib/server/auth/sessionManager';
import { setSessionCookie } from '$lib/server/auth/cookies';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const registerSchema = z.object({
    username: z
        .string({ required_error: 'Username is required' })
        .min(3, { message: 'Username must be at least 3 characters' })
        .max(30, { message: 'Username cannot exceed 30 characters' })
        .trim(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' }),
    // email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')), // If you add email
});

// redirect logged-in users away from the register page
export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(303, '/homepage'); //
    }
    return {};
};

export const actions: Actions = {
    default: async (event) => {
        const { request } = event; // destructure event for clarity
        await connectToDatabase();

        const formData = await request.formData();
        const rawData = Object.fromEntries(formData);

        try {
            // validate form data
            const parsedData = registerSchema.parse(rawData);
            const { username, password } = parsedData;
            // const email = parsedData.email;

            // Check if username already exists
            const existingUserByUsername = await User.findOne({ username }).lean(); // .lean() for faster, plain object
            if (existingUserByUsername) {
                return fail(400, {
                    data: { username }, // non-sensitive confirmed data
                    errors: { username: 'Username already taken. Please choose another.' }
                });
            }

            // if email is used and needs to be unique:
            // if (email) {
            //     const existingUserByEmail = await User.findOne({ email }).lean();
            //     if (existingUserByEmail) {
            //         return fail(400, {
            //             data: { username, email },
            //             errors: { email: 'Email address is already in use.' }
            //         });
            //     }
            // }

            // hash the password
            const hashedPassword = await hashPassword(password);

            // create the new user
            const newUser = new User({
                username,
                hashedPassword,
                // email: email || undefined,
            });
            await newUser.save();

            // create session for the new user
            const { clientToken, expiresAt } = await createSession(
                newUser._id, // Mongoose _id is ObjectId, createSession expects this
            );

            // set the session cookie
            setSessionCookie(event, clientToken, expiresAt);

            // update locals for the current request, so new loads in this request cycle see the user
            event.locals.user = newUser.toJSON() as App.Locals['user']; // serialize for immediate use
            event.locals.session = {
                _id: (await import('$lib/server/auth/sessionManager')).hashTokenForSessionId(clientToken).toString(), // Re-hash or get from createSession if it returned it
                userId: newUser._id.toString(),
                expiresAt : Date.toString(),
            };


            // successfully registered and logged in
            redirect(303, '/homepage');

        } catch (error) {
            const submittedData = { username: rawData.username as string | undefined /*, email: rawData.email as string | undefined */ };
            if (error instanceof z.ZodError) {
                const validationErrors = fromZodError(error);
                console.warn('Registration validation error:', validationErrors.toString());
                return fail(400, {
                    data: submittedData,
                    errors: validationErrors.details.reduce((acc, curr) => {
                        if (curr.path && curr.path.length > 0) {
                            acc[curr.path[0] as string] = curr.message;
                        }
                        return acc;
                    }, {} as Record<string, string>)
                });
            }
            // unexpected errors
            console.error('Registration action error:', error);
            return fail(500, {
                data: submittedData,
                errors: { form: 'An unexpected error occurred. Please try again later.' }
            });
        }
    }
};