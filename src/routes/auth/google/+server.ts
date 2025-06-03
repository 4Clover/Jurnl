// FOLLOWING TUTORIAL CODE: https://lucia-auth.com/tutorials/google-oauth/sveltekit

import type { RequestHandler } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { dev } from "$app/environment";
import { OAuth2Client } from "google-auth-library";

export const GET: RequestHandler = async ({ cookies }) => {
	
	// Generate a unique state
	const state = crypto.randomUUID(); // from Node js

	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: dev,
		maxAge: 60 * 10 
	});

	const client = new OAuth2Client(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		"http://localhost:3000/auth/google/callback"
	);

	const authURL = client.generateAuthUrl({
		access_type: 'offline',
		scope: ['profile', 'email'],
		state: state
	});

	throw redirect(303, authURL);

};