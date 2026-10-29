import type { GameEvents } from "./gameEvents.js";

/** Idle connections get a comment this often so proxies and phones keep them open. */
export const PING_INTERVAL_MS = 20_000;

/**
 * A Server-Sent Events body for one game: a `data:` line per change message
 * and a `: ping` comment while idle. Unsubscribes and stops the timer when the
 * client goes away (cancel or abort), so closed tabs leave nothing behind.
 */
export function gameEventStream(
	gameId: string,
	events: Pick<GameEvents, "subscribe">,
	signal?: AbortSignal,
	pingMs = PING_INTERVAL_MS,
): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	let cleanup = () => {};

	return new ReadableStream<Uint8Array>({
		start(controller) {
			let closed = false;
			const send = (text: string) => {
				if (closed) return;
				try {
					controller.enqueue(encoder.encode(text));
				} catch {
					cleanup();
				}
			};

			const unsubscribe = events.subscribe(gameId, (message) =>
				send(`data: ${JSON.stringify(message)}\n\n`),
			);
			const timer = setInterval(() => send(": ping\n\n"), pingMs);
			const onAbort = () => {
				cleanup();
				try {
					controller.close();
				} catch {}
			};
			cleanup = () => {
				if (closed) return;
				closed = true;
				clearInterval(timer);
				unsubscribe();
				signal?.removeEventListener("abort", onAbort);
			};

			if (signal?.aborted) return onAbort();
			signal?.addEventListener("abort", onAbort, { once: true });
			send("retry: 3000\n\n: connected\n\n");
		},
		cancel() {
			cleanup();
		},
	});
}
