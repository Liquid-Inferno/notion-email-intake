import { z } from 'zod';

export type NotionEmailIntakePage = {
	parent: { database_id: string };
	icon: { emoji: string };
	properties: Record<string, unknown>;
};

export const EmailIntakeRequestBody = z.object({
	name: z.string().optional(),
	email: z.string(),
	message: z.string().optional(),
});

export type EmailIntakeRequestBodyModel = z.infer<
	typeof EmailIntakeRequestBody
>;
