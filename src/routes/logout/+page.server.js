import { redirect } from '@sveltejs/kit';
import { logout } from '$lib/auth.js';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ cookies }) => {
		logout(cookies);
		throw redirect(303, '/');
	}
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	// If someone navigates to /logout directly, log them out and redirect
	logout(cookies);
	throw redirect(303, '/');
}