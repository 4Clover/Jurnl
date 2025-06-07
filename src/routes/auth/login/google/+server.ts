import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { 
    GOOGLE_CLIENT_ID, 
    GOOGLE_CLIENT_SECRET,
    BASE_URL
} from '$env/static/private';
import {dev} from '$app/environment'
import { OAuth2Client } from 'google-auth-library';

export const GET: RequestHandler = async ({ cookies }) => {
    // Generate a unique state parameter for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state in an httpOnly cookie with short expiry
    cookies.set('oauth_state', state, {
        path: '/',
        httpOnly: true,
        secure: !dev,
        sameSite: 'lax',
        maxAge: 60 * 10 // 10 minutes
    });
    
    // Create OAuth2 client
    const client = new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        `${BASE_URL}/auth/login/google/callback`
    );
    
    // Generate auth URL
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        state: state
    });

    console.log('🔗 Initiating OAuth flow with state:', state);
    console.log('🔗 Redirect URI:', `${BASE_URL}/auth/login/google/callback`);

    // Redirect to Google auth
    throw redirect(303, authUrl);
};