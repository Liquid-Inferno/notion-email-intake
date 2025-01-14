import { buildNotionEmailIntakePage, fetchNotion } from './lib/notion';
import { EmailIntakeRequestBody } from './models/notion';

export interface Env {
	NOTION_API_KEY: string;
	NOTION_EMAIL_INTAKE_DATABASE_ID: string;
}

type ResponseBody =
	| {
		ok: false;
		error: string;
	}
	| { ok: true };

const corsHeaders = {
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Origin': 'http://localhost:5173',
};

const jsonResponse = (status: number, body: ResponseBody) => {
	if (!body.ok) {
		const { ok, error } = body;
		return Response.json(
			{
				ok,
				error,
			},
			{ status, headers: corsHeaders },
		);
	}

	const { ok } = body;
	return Response.json(
		{
			ok,
		},
		{ status, headers: corsHeaders },
	);
};

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		if (request.method !== 'POST') {
			return jsonResponse(405, { ok: false, error: 'expecting POST' });
		}

		try {
			const body = await request.json();
			const parseResult = await EmailIntakeRequestBody.safeParseAsync(body);
			if (!parseResult.success) {
				return jsonResponse(422, {
					ok: false,
					error: parseResult.error.toString(),
				});
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
				return jsonResponse(500, { ok: false, error: 'error fetching Notion' });
			}

			return jsonResponse(200, { ok: true });
		} catch {
			return jsonResponse(422, { ok: false, error: 'invalid JSON body' });
		}
	},
} satisfies ExportedHandler<Env>;
