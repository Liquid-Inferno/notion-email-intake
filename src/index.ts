import { buildNotionEmailIntakePage, fetchNotion } from './lib/notion';
import { EmailIntakeRequestBody } from './models/notion';

export interface Env {
	NOTION_API_KEY: string;
	NOTION_EMAIL_INTAKE_DATABASE_ID: string;
}

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		if (request.method !== 'POST') {
			return Response.json(
				{ ok: false, error: 'expecting POST' },
				{ status: 405 },
			);
		}

		try {
			const body = await request.json();
			const parseResult = await EmailIntakeRequestBody.safeParseAsync(body);
			if (!parseResult.success) {
				return Response.json(
					{ ok: false, error: parseResult.error },
					{ status: 422 },
				);
			}

			const { email, message, name } = parseResult.data;

			const notionRequestBody = buildNotionEmailIntakePage(
				env.NOTION_EMAIL_INTAKE_DATABASE_ID,
				email,
				name,
				message,
			);

			try {
				await fetchNotion(
					env.NOTION_API_KEY,
					'POST',
					'/v1/pages',
					notionRequestBody,
				);
			} catch (error) {
				console.error(error);
				return Response.json(
					{ ok: false, error: 'error fetching Notion' },
					{ status: 500 },
				);
			}

			return Response.json({ ok: true }, { status: 200 });
		} catch {
			return Response.json(
				{ ok: false, error: 'invalid JSON body' },
				{ status: 422 },
			);
		}
	},
} satisfies ExportedHandler<Env>;
