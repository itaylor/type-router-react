// Build script for creating npm package from Deno module
// Run with: deno run -A scripts/build_npm.ts

import { build, emptyDir } from '@dnt/mod';
import denoJson from '../deno.json' with { type: 'json' };

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
    version: denoJson.version,
    description: denoJson.description,
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
      'react': '>=18.0.0',
      'react-dom': '>=18.0.0',
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
    },
    homepage: 'https://github.com/itaylor/type-router-react',
    repository: {
      type: 'git',
      url: 'https://github.com/itaylor/type-router-react.git',
    },
  },
  postBuild() {
    // Copy README and LICENSE to npm directory
    Deno.copyFileSync('README.md', 'npm/README.md');
    Deno.copyFileSync('LICENSE', 'npm/LICENSE');
    console.log('✅ README.md and LICENSE copied to npm directory');

    // Deletes the dependencies key out of the npm/package.json file.
    // This project only has peer deps and a dep on type-router-react, which
    // it looks like DNT includes as a copy.
    const packageJsonPath = 'npm/package.json';
    const packageJson = JSON.parse(Deno.readTextFileSync(packageJsonPath));
    delete packageJson.dependencies;
    Deno.writeTextFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
    );
    console.log('✅ Dependencies key deleted from npm/package.json');
  },
  compilerOptions: {
    target: 'ES2020',
    lib: ['ES2020', 'DOM'],
    // put these back once https://github.com/denoland/dnt/issues/384 is closed
    //    jsx: 'react-jsx',
    //    jsxImportSource: 'react',
  },
  typeCheck: 'both',
  declaration: 'separate',
  scriptModule: false,
  test: false,
  mappings: {},
});

console.log('✅ npm package built successfully!');
console.log('📦 Package ready in ./npm directory');
console.log('\nTo publish:');
console.log('  cd npm');
console.log('  npm publish');
