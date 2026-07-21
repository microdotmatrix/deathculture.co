import { createUploadthing, UploadThingError, type FileRouter } from 'uploadthing/server';
import { auth } from './auth';

const f = createUploadthing();

export const fileRouter = {
	/** Feature images for blog posts — admin only. */
	postImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
		.middleware(async ({ req }) => {
			const session = await auth.api.getSession({ headers: req.headers });

			if (!session || session.user.role !== 'admin') {
				throw new UploadThingError('Admin access required');
			}

			return { userId: session.user.id };
		})
		.onUploadComplete(({ file }) => {
			return { url: file.ufsUrl };
		})
} satisfies FileRouter;

export type PostFileRouter = typeof fileRouter;
