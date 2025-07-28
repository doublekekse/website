import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';

export default defineConfig({
	css: {
		postcss: {
			map: true,
			plugins: [autoprefixer()]
		}
	}
});
