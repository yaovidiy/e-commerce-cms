import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { listObjectsInR2, deleteFromR2 } from '$lib/server/r2';
import { getRequestEvent } from '$app/server';

export const GET: RequestHandler = async () => {
	try {
		const event = getRequestEvent();
		if (!event?.locals?.user?.isAdmin) {
			return new Response('Unauthorized', { status: 401 });
		}

		// Get all objects from R2
		const keys = await listObjectsInR2();

		if (keys.length === 0) {
			const encoder = new TextEncoder();
			return new Response(encoder.encode(`data: ${JSON.stringify({ type: 'complete', total: 0, deleted: 0 })}\n\n`), {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
				}
			});
		}

		// Create a ReadableStream that sends progress updates
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				const total = keys.length;
				let isClosed = false;

				// Check if client disconnected
				const originalClose = controller.close.bind(controller);
				controller.close = () => {
					isClosed = true;
					return originalClose();
				};

				try {
					// Send initial event with total count
					controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', total })}\n\n`));

					// Delete each file with 2-second delay to prevent API overflow
					let deleted = 0;
					for (const key of keys) {
						// Check if client disconnected
						if (isClosed) {
							console.log('Client disconnected, stopping bucket clearing');
							break;
						}

						try {
							await deleteFromR2(key);
							deleted++;

							// Send progress update
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ type: 'progress', current: deleted, total })}\n\n`
								)
							);
						} catch (error) {
							console.error(`Error deleting file ${key}:`, error);
							// Continue with next file even if one fails
							deleted++;
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ type: 'progress', current: deleted, total, error: true })}\n\n`
								)
							);
						}

						// Wait 0.5 seconds before deleting the next file
						await new Promise((resolve) => setTimeout(resolve, 500));
					}

					// Only delete from database if we completed all deletions
					if (!isClosed) {
						// Delete all assets from database
						await db.delete(tables.asset);

						// Send completion event
						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify({ type: 'complete', total, deleted })}\n\n`)
						);
					}

					controller.close();
				} catch (error) {
					console.error('Error clearing R2 bucket:', error);
					if (!isClosed) {
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' })}\n\n`
							)
						);
					}
					controller.close();
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			}
		});
	} catch (error) {
		console.error('Error starting clear bucket stream:', error);
		return new Response(`data: ${JSON.stringify({ type: 'error', message: 'Failed to start stream' })}\n\n`, {
			status: 500,
			headers: {
				'Content-Type': 'text/event-stream'
			}
		});
	}
};
