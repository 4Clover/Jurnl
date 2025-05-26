import type { RandomReader } from '@oslojs/crypto/random';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { Types } from 'mongoose';
import { Session, User } from '$lib/server/database/schemas';
import type { IUser, SerializableSession, SerializableUser } from '$lib/server/database/schemas';


const SESSION_LIFESPAN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_TOKEN_BYTE_LENGTH = 32;

const randomReader: RandomReader = {
    read(bytes: Uint8Array): void {
        crypto.getRandomValues(bytes);
    }
};

function generateSecureRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    randomReader.read(bytes);
    return bytes;
}

/**
 * Generates a cryptographically secure random token for the client-side session cookie.
 */
export function generateClientSessionToken(): string {
    const randomBytes = generateSecureRandomBytes(SESSION_TOKEN_BYTE_LENGTH);
    return encodeBase32LowerCaseNoPadding(randomBytes);
}

/**
 * Hashes the client-side session token to be used as the session ID in the database.
 * @param clientToken The raw token sent to the client.
 * @returns A promise that resolves to the SHA-256 hex encoded hash.
 */
export async function hashTokenForSessionId(clientToken: string): Promise<string> {
    const tokenBuffer = new TextEncoder().encode(clientToken);
    const hashedBuffer = sha256(tokenBuffer);
    return encodeHexLowerCase(new Uint8Array(hashedBuffer));
}

/**
 * Creates a new session in the database for the given user.
 * @param userId The ObjectId of the user.
 * @returns A promise resolving to an object containing the clientToken and the session's expiresAt date.
 */
export async function createSession(
    userId: Types.ObjectId,
): Promise<{ clientToken: string; sessionId: string; expiresAt: Date }> {
    const clientToken = generateClientSessionToken();
    const sessionId = await hashTokenForSessionId(clientToken);
    const expiresAt = new Date(Date.now() + SESSION_LIFESPAN_MS);
    // delete any old session with same id
    await Session.findByIdAndDelete(sessionId).exec();

    const newSession = new Session({
        _id: sessionId,
        userId,
        expiresAt,
    });
    await newSession.save();

    return { clientToken, sessionId, expiresAt };
}

/**
 * Validates a client-provided session token.
 * @param clientToken The token from the client's cookie.
 * @returns A promise resolving to the user and session if valid, otherwise nulls.
 */
export async function validateClientSessionToken(
    clientToken: string
): Promise<{ user: IUser | null; session: SerializableSession | null }> { // Return SerializableSession
    if (!clientToken) return { user: null, session: null };

    const sessionId = await hashTokenForSessionId(clientToken);
    const sessionDoc = await Session.findById(sessionId).exec(); // don't populate user yet

    if (!sessionDoc || sessionDoc.expiresAt.getTime() < Date.now()) {
        if (sessionDoc) await Session.findByIdAndDelete(sessionId).exec();
        return { user: null, session: null };
    }

    //  Mongoose document.
    const user = await User.findById(sessionDoc.userId).exec();

    if (!user) {
        await Session.findByIdAndDelete(sessionId).exec(); // data integrity issue
        return { user: null, session: null };
    }

    // serializable session
    const serializableSessionData: SerializableSession = {
        _id: sessionDoc._id, // string
        userId: user._id.toString(), //  user ObjectId to string
        expiresAt: sessionDoc.expiresAt.toISOString(), // Date to ISO string
    };

    return {
        user, // full Mongoose user document
        session: serializableSessionData, // prepared session
    };
}


/**
 * Invalidates a single session by its client token.
 * @param clientToken The client-side session token.
 */
export async function invalidateSessionByClientToken(clientToken: string): Promise<void> {
    if (!clientToken) return;
    const sessionId = await hashTokenForSessionId(clientToken);
    await Session.findByIdAndDelete(sessionId).exec();
}

/**
 * Invalidates all sessions for a given user.
 * @param userId The ObjectId of the user.
 */
export async function invalidateAllUserSessions(userId: Types.ObjectId): Promise<void> {
    await Session.deleteMany({ userId }).exec();
}