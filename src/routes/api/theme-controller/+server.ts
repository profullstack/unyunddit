import { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const data = await request.formData();
	const theme = data.get('theme');

	if (theme !== 'light' && theme !== 'dark') {
		return new Response('Invalid theme', { status: 400 });
	}

	cookies.set('theme', theme.toString(), {
		path: '/',
		maxAge: 60 * 60 * 60 * 30,
		sameSite: 'lax',
		httpOnly: false
	});

	return new Response(null, {
		status: 303,
		headers: { Location: url.searchParams.get('redirect') || '/' }
	});
};
