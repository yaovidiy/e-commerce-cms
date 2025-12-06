/**
 * Background Task Progress Streaming
 * Allows clients to subscribe to real-time task progress updates via SSE
 */

import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// Store for active streaming connections
const activeStreams = new Map<string, { interval: NodeJS.Timeout; send: (data: any) => void }>();

export const GET: RequestHandler = async ({ params, locals }) => {
	const { taskId } = params;
	const user = locals.user;

	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	// Verify task belongs to user
	const [task] = await db
		.select()
		.from(tables.backgroundTask)
		.where(
			and(
				eq(tables.backgroundTask.id, taskId),
				eq(tables.backgroundTask.userId, user.id)
			)
		);

	if (!task) {
		return new Response('Task not found', { status: 404 });
	}

	// Create SSE response
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			const streamId = `${user.id}-${taskId}-${Date.now()}`;

			const sendData = (data: any) => {
				try {
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
					);
				} catch (error) {
					console.error('Failed to send SSE data:', error);
				}
			};

			// Send initial state
			const [currentTask] = await db
				.select()
				.from(tables.backgroundTask)
				.where(eq(tables.backgroundTask.id, taskId));

			if (currentTask) {
				sendData({
					id: currentTask.id,
					status: currentTask.status,
					progress: currentTask.progress,
					processedItems: currentTask.processedItems,
					totalItems: currentTask.totalItems,
					updatedAt: currentTask.updatedAt
				});
			}

			// Poll for updates every second
			const interval = setInterval(async () => {
				try {
					const [updatedTask] = await db
						.select()
						.from(tables.backgroundTask)
						.where(eq(tables.backgroundTask.id, taskId));

					if (updatedTask) {
						// Send update
						sendData({
							id: updatedTask.id,
							status: updatedTask.status,
							progress: updatedTask.progress,
							processedItems: updatedTask.processedItems,
							totalItems: updatedTask.totalItems,
							updatedAt: updatedTask.updatedAt
						});

						// Close stream when task is completed
						if (['completed', 'failed', 'cancelled'].includes(updatedTask.status)) {
							clearInterval(interval);
							activeStreams.delete(streamId);
							controller.close();
						}
					}
				} catch (error) {
					console.error('Failed to poll task status:', error);
					clearInterval(interval);
					activeStreams.delete(streamId);
					controller.close();
				}
			}, 1000);

			// Store the interval for cleanup
			activeStreams.set(streamId, {
				interval,
				send: sendData
			});

			// Cleanup on close
			const cleanup = () => {
				clearInterval(interval);
				activeStreams.delete(streamId);
			};

			// Handle client disconnect
			const originalClose = controller.close.bind(controller);
			controller.close = function () {
				cleanup();
				return originalClose();
			};
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
