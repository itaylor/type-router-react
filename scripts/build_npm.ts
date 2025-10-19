// Build script for creating npm package from Deno module
// Run with: deno run -A scripts/build_npm.ts

import { build, emptyDir } from '@dnt/mod';

await emptyDir('./npm');

await build({
  entryPoints: ['./type-router-react.tsx'],
  outDir: './npm',
  shims: {
    deno: false,
    custom: [
      {
        package: {
          name: 'globalThis',
          version: '1.0.0',
        },
        globalNames: ['globalThis'],
      },
    ],
  },
  package: {
    name: '@itaylor/type-router-react',
    version: '1.0.0',
    description:
      'React bindings for type-router - A lightweight, type-safe router with first-class TypeScript support',
    keywords: [
      'react',
      'router',
      'routing',
      'spa',
      'single-page-application',
      'typescript',
      'type-safe',
      'navigation',
      'history',
      'hash-router',
      'frontend',
      'browser',
      'hooks',
      'components',
      'react-router',
      'jsx',
      'tsx',
    ],
    license: 'MIT',
    author: 'itaylor',
    engines: {
      node: '>=14.0.0',
    },
    peerDependencies: {
      'react': '>=16.8.0',
      'react-dom': '>=16.8.0',
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
    },
  },
  postBuild() {
    // Copy README and LICENSE to npm directory
    Deno.copyFileSync('README.md', 'npm/README.md');
    Deno.copyFileSync('LICENSE', 'npm/LICENSE');
    console.log('✅ README.md and LICENSE copied to npm directory');
  },
  compilerOptions: {
    target: 'ES2020',
    lib: ['ES2020', 'DOM'],
    jsx: 'react-jsx',
    jsxImportSource: 'react',
  },
  typeCheck: 'both',
  declaration: 'separate',
  scriptModule: false,
  test: false,
  mappings: {
    // Map the type-router dependency to the published npm package
    '../type-router/type-router.ts': {
      name: '@itaylor/type-router',
      version: '^1.0.0',
    },
  },
});

console.log('✅ npm package built successfully!');
console.log('📦 Package ready in ./npm directory');
console.log('\nTo publish:');
console.log('  cd npm');
console.log('  npm publish');
