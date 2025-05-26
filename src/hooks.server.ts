import type {Handle, HandleServerError} from '@sveltejs/kit';
import {dev} from '$app/environment';
import connectToDatabase from '$lib/server/database';
import {validateClientSessionToken} from '$lib/server/auth/sessionManager';
import {SESSION_COOKIE_NAME, setSessionCookie} from '$lib/server/auth/cookies';
import type {IUser} from '$lib/server/database/schemas';
/**
 * Handles session validation for incoming requests.
 */
export const handle: Handle = async ({ event, resolve }) => {
    try {
        await connectToDatabase();
    } catch (error) {
        console.error('DB connection failed in handle hook:', error);
    }

    const clientToken = event.cookies.get(SESSION_COOKIE_NAME);
    let fullUserDocument: IUser | null = null; // To hold the Mongoose document internally

    if (clientToken) {
        // validateClientSessionToken now returns { user: MongooseDoc | null, session: SerializableSession | null }
        const { user, session: serializableSessionData } = await validateClientSessionToken(clientToken);

        if (user && serializableSessionData) {
            fullUserDocument = user; // full Mongoose doc for server-side use before serialization
            event.locals.session = serializableSessionData;

            event.locals.user = user.toJSON() as App.Locals['user'];

            setSessionCookie(event, clientToken, new Date(serializableSessionData.expiresAt));
        } else {
            event.locals.user = null;
            event.locals.session = null;
        }
    } else {
        event.locals.user = null;
        event.locals.session = null;
    }

    return resolve(event);
};

/**
 *  error handling for server-side errors
 */
export const handleError: HandleServerError = ({ error, event }) => {
    const errorId = crypto.randomUUID(); // unique ID for this error instance

    // --- SERVER ---
    console.error(`Error ID: ${errorId}`);
    console.error('Error caught in handleError hook:');
    console.error('Event:', event);
    console.error(error); // full error object

    // --- CLIENT ---
    const message = (error instanceof Error) ? error.message : 'An unexpected server error occurred.';
    const code = (error instanceof Error && 'code' in error) ? String(error.code) : undefined;


    return {
        message: `Something went wrong on our end. Error ID: ${errorId}. ${dev ? message : ''}`,
        code: dev ? code : undefined, // send code in dev
        stack: dev && error instanceof Error ? error.stack : undefined // send stack in dev
    };
};