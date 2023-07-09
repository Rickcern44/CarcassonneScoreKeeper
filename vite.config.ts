import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/tests/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: "v8",
			reporter: ["json-summary"],
			lines: 60,
			statements: 60,
			functions: 60,
			branches: 60
		}
	}
});
