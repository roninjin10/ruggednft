import { esbuildPluginEvmts } from '@evmts/esbuild-plugin'
import { defineConfig } from 'tsup'
import packageJson from './package.json'

export default defineConfig({
	name: packageJson.name,
	entry: ['scripts/deploy.ts'],
	outDir: 'dist',
	format: ['esm'],
	splitting: false,
	sourcemap: true,
	bundle: true,
	external: ['*'],
	clean: false,
	esbuildPlugins: [esbuildPluginEvmts()],
})
