import { createUploadthing, type FileRouter, UploadThingError } from 'uploadthing/server';
import { auth } from './auth';

const f = createUploadthing();

export const fileRouter = {
	/** Feature images for blog posts — admin only. */
	postImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
		.middleware(async ({ req }) => {
			const session = await auth.api.getSession({ headers: req.headers });

			if (session?.user.role !== 'admin') {
				throw new UploadThingError('Admin access required');
			}

			return { userId: session.user.id };
		})
		.onUploadComplete(({ file }) => {
			return { url: file.ufsUrl };
		}),

	/** Team-page portraits — admin only, matching who can edit the roster. */
	teamPortrait: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
		.middleware(async ({ req }) => {
			const session = await auth.api.getSession({ headers: req.headers });

			if (session?.user.role !== 'admin') {
				throw new UploadThingError('Admin access required');
			}

			return { userId: session.user.id };
		})
		.onUploadComplete(({ file }) => {
			return { url: file.ufsUrl };
		})
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
