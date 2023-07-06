import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: "istanbul",
			reporter: ['text', 'json', "json-summary",'html'],
			lines: 60,
			statements: 60,
			functions: 60,
			branches: 60
		}
	}
});
