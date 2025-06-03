// FOLLOWING TUTORIAL CODE: https://lucia-auth.com/tutorials/google-oauth/sveltekit

import {error, redirect} from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import type { OAuth2Client } from "google-auth-library";
import { setSessionCookie } from "$lib/server/auth/cookies";
import { createSession } from "$lib/server/auth/sessionManager";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";

import { User } from "$lib/server/database/schemas";
import { connectToDatabase } from "$lib/server/database";
import { L } from "vitest/dist/chunks/reporters.d.C-cu31ET.js";



async function createUsername(email: string): Promise<string> {
	try {
		await connectToDatabase();
	}
	catch (error) {
		console.error("Database connection failed:", error);
		throw error;
	}
	let defaultUsername = email
		.split('@')[0]
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '') // No illegal characters
		.substring(0,16); 
	
	// defaulUsername = email of user, but if shorter than 3 characters = User
	if (defaultUsername.length < 3) {
		defaultUsername = "User";
	}

	let tempUsername = defaultUsername;
	let count = 1;
	// Check if username is already taken
	while (await User.exists({ username: tempUsername }))
	{
		tempUsername = `${defaultUsername}${count}`;
		count++;
		
		if (count > 100) {
			throw new Error("Too many users with similar usernames, please try again later.");
		}
	}
	return tempUsername;
}

export const GET: RequestHandler = async (event) => {
	const { url, cookies, locals } = event;
	let redirectTo : string = "";

	try{
		const code = url.searchParams.get('code');
		if(!code) {
			throw error(400, "Invalid authorization code.");
		}
		const state = url.searchParams.get('state');
		if(!state) {
			throw error(400, "Invalid state parameter.");
		}
		const cookieState = cookies.get('state');
		if(!cookieState || cookieState !== state)
		{
			throw error(400, 'Invalid stored state parameter.')
		}

		const client = new OAuth2Client(
			GOOGLE_CLIENT_ID,	
			GOOGLE_CLIENT_SECRET,
			"http://localhost:5173/login/google/callback"
		)
		
		const { tokens } = await client.getToken(code);
		client.setCredentials(tokens);

		const ticket = await client.verifyIdToken({
			idToken: tokens.id_token!,
			audience: GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		if(!payload)
		{
			error(500, "Unable to get Google user information.");
		} 

		const { sub: google_id, email, name, picture } = payload;

		if(!email)
		{
			error(400, "Unable to find Google email.");
		}
		try{
			await connectToDatabase();
		}
		catch(error)
		{
			console.error("Error connecting to the database: ", error);
		}

		let user = await User.findOne({ google_id });
		let isNewUser = false;

		if(!user){
			user = await User.findOne({ email: email.toLowerCase() });
			if(!user){
				isNewUser = true;
				const username = await createUsername(email);
				user = new User({
					email: email.toLowerCase(),
					google_id,
					username,
					username_display: name || email.split('@'[0]),
					avatar_url: picture || null,
					auth_provider: 'google',
					bio_text: '',
					journals: [],
					close_friends: [],
					can_view_friends: [],
				});
			}
			else{
				user.google_id = google_id;
				user.auth_provider = 'google';
				if(!user.avatar_url && picture){
					user.avatar_url = picture;
				}
			}
		}

		user.last_login = new Date();
		await user.save();

		const sessionDetails = await createSession(user._id);
		setSessionCookie(event, sessionDetails.clientToken, sessionDetails.expiresAt);
		
		locals.user = {
			id: user._id.toString(),
			username: user.username,
			email: user.email,
			avatarUrl: user.createdAt.toISOString(),
			createdAt: user.updatedAt.toISOString(),
		};
		
		locals.session = {
			_id: sessionDetails.sessionId,
			userId: user._id.toString(),
			expiresAt: sessionDetails.expiresAt.toISOString(),
		};

		// Clean up
		cookies.delete('oauth_state', { path: '/' });

		redirectTo = isNewUser && !user.bio_text ? '/profile' : '/journals';


	} catch(error)
	{
		console.error('Callback error:', error);
		throw error(500, 'Failure to authenticated, please try again later.');
	} finally{
		redirect(303, redirectTo);
	}
}