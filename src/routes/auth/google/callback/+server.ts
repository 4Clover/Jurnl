import type { RequestHandler } from './$types';
import { OAuth2Client } from 'google-auth-library';
import { error, redirect } from '@sveltejs/kit';
// @ts-ignore
import {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL,} from '$env/static/private';
import { User } from '$schemas';
import { createSession } from '$auth/sessionManager';
import { setSessionCookie } from '$auth/cookies';
import connectToDatabase from '$database';


async function generateUniqueUsername(email: string): Promise<string> {
    await connectToDatabase();

    // Extract base username from email
    // @ts-ignore
    let baseUsername = email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '') // Remove invalid characters
        .substring(0, 16); // Leave room for numbers

    if (baseUsername.length < 3) {
        baseUsername = 'user';
    }

    // base username is available
    let username = baseUsername;
    let counter = 1;

    while (await User.exists({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;

        if (counter > 9999) {
            throw new Error('Unable to generate unique username');
        }
    }

    return username;
}

export const GET: (event: any) => Promise<any> = async (event) => {
    const { url, cookies, locals } = event;

    let redirectPath: string = '/login?error=oauth_failed';

    console.log('🔄 Processing OAuth callback...');
    console.log('📋 URL params:', Object.fromEntries(url.searchParams));

    try {
        // fill local code and state variables from query
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        if (!code || !state) {
            console.error('❌ Missing code or state:', {
                hasCode: !!code,
                hasState: !!state,
            });
            redirectPath = '/login?error=missing_params';
            return;
        }

        // 🔧 FIX: Check for 'oauth_state' not 'state'
        const storedState = cookies.get('oauth_state');
        if (!storedState || storedState !== state) {
            console.error('❌ State mismatch:', {
                stored: storedState,
                received: state,
            });
            redirectPath = '/login?error=invalid_state';
            return;
        }

        console.log('✅ State validation passed');

        const client = new OAuth2Client(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            `${BASE_URL}/auth/google/callback`,
        );

        console.log('🔄 Exchanging code for tokens...');
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        console.log('🔄 Verifying ID token...');
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            console.error('❌ No payload from Google');
            redirectPath = '/login?error=no_payload';
            return;
        }

        const { sub: google_id, email, name, picture } = payload;

        if (!email) {
            console.error('❌ No email from Google');
            redirectPath = '/login?error=no_email';
            return;
        }

        console.log('✅ Google user info received:', {
            email,
            name: name || 'N/A',
        });

        await connectToDatabase();
        let user = await User.findOne({ google_id });
        let isNewUser = false;

        if (!user) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                user.google_id = google_id;
                user.auth_provider = 'google';
                if (!user.avatar_url && picture) {
                    user.avatar_url = picture;
                }
                console.log('🔗 Linked existing user account');
            } else {
                // NEW USER
                isNewUser = true;
                const username = await generateUniqueUsername(email);
                user = new User({
                    email: email.toLowerCase(),
                    google_id,
                    username,
                    username_display: name || email.split('@')[0],
                    avatar_url: picture || null,
                    auth_provider: 'google',
                    bio_text: '',
                    journals: [],
                    close_friends: [],
                    can_view_friends: [],
                });
                console.log('👤 Created new user:', username);
            }
        } else {
            console.log('👋 Existing Google user found');
        }

        // Update last login
        user.last_login = new Date();
        await user.save();

        console.log('🔄 Creating session...');
        const sessionDetails = await createSession(user._id);
        setSessionCookie(
            event,
            sessionDetails.clientToken,
            sessionDetails.expiresAt,
        );

        // set locals with new user info
        locals.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            createdAt: user.createdAt.toISOString(),
            username_display: user.username_display,
            bio_text: '',
            auth_provider: 'google',
        };
        locals.session = {
            _id: sessionDetails.sessionId,
            userId: user._id.toString(),
            expiresAt: sessionDetails.expiresAt.toISOString(),
        };

        // delete OAuth state cookie
        cookies.delete('oauth_state', { path: '/' });

        // redirect path for success
        redirectPath = isNewUser && !user.bio_text ? '/profile' : '/journals';

        console.log('✅ OAuth flow completed successfully');
        console.log('🔄 Will redirect to:', redirectPath);
    } catch (err) {
        console.error('💥 OAuth callback error:', err);

        // clean up partial state
        cookies.delete('oauth_state', { path: '/' });

        console.log('🔄 Error occurred, will redirect to:', redirectPath);
    } finally {
        console.log('🚀 Final redirect to:', redirectPath);
        redirect(303, redirectPath);
    }
};
