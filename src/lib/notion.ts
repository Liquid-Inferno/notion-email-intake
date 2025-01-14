import { NotionEmailIntakePage } from '../models/notion';

export function buildNotionEmailIntakePage(
	databaseId: string,
	email: string,
	name?: string,
	message?: string,
): NotionEmailIntakePage {
	const body: NotionEmailIntakePage = {
		parent: {
			database_id: databaseId,
		},
		icon: {
			emoji: '✉️',
		},
		properties: {
			Email: {
				title: [
					{
						text: {
							content: email,
						},
					},
				],
			},
		},
	};

	if (name) {
		body.properties['Name'] = {
			rich_text: [
				{
					text: {
						content: name,
					},
				},
			],
		};
	}

	if (message) {
		body.properties['Message'] = {
			rich_text: [
				{
					text: {
						content: message,
					},
				},
			],
		};
	}

	return body;
}

export async function fetchNotion(
	authorizationKey: string,
	method: string,
	path: string,
	body?: unknown,
) {
	const url = new URL(path, 'https://api.notion.com');
	const bodyString = body ? JSON.stringify(body) : undefined;
	const req = new Request(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authorizationKey}`,
			'Notion-Version': '2022-06-28',
		},
		body: bodyString,
	});
	const res = await fetch(req);
	if (res.status < 200 || res.status >= 400) {
		throw new Error('error fetching from Notion');
	}
	return res;
}
