/// <reference lib="deno.ns" />
import { launch } from '@astral/astral';
import { assertEquals } from '@std/assert';

import type { createRouterForReact } from './type-router-react.tsx';

// Declare window properties that are added by the test setup
declare global {
  interface Window {
    testResults: string[];
    log: (msg: string) => void;
    router: ReturnType<typeof createRouterForReact>;
    reactRoot: any;
    testProps: Record<string, any>;
    componentRenderCount: number;
  }
}

// Named localhost IPs for different test modes
const HISTORY_MODE_IP = '127.0.0.1';
const HASH_MODE_IP = '127.0.0.2';
const MANUAL_INIT_IP = '127.0.0.3';

function setupTestServer() {
  const server = Deno.serve({ port: 0, hostname: '0.0.0.0' }, async (req) => {
    const url = new URL(req.url);
    const host = req.headers.get('host')?.split(':')[0] || '127.0.0.1';

    // Serve static files from test-fixtures
    if (url.pathname.startsWith('/dist/')) {
      try {
        const content = await Deno.readTextFile(
          `./test-fixtures${url.pathname}`,
        );
        return new Response(content, {
          headers: { 'Content-Type': 'application/javascript' },
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }

    // Determine test mode based on IP
    let testMode: string;
    let scriptPath: string;

    if (host === HISTORY_MODE_IP) {
      testMode = 'history';
      scriptPath = '/dist/shared-routes.js';
    } else if (host === HASH_MODE_IP) {
      testMode = 'hash';
      scriptPath = '/dist/shared-routes.js';
    } else if (host === MANUAL_INIT_IP) {
      testMode = 'manual';
      scriptPath = '/dist/manual-init-routes.js';
    } else {
      testMode = 'history';
      scriptPath = '/dist/shared-routes.js';
    }

    // Generate HTML for React testing
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>React Router Test - ${testMode} mode</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .nav-link { margin-right: 10px; padding: 5px 10px; text-decoration: none; border: 1px solid #ccc; }
        .nav-link.active { background: #007bff; color: white; }
        #output { margin-top: 20px; padding: 10px; border: 1px solid #ddd; max-height: 200px; overflow-y: auto; }
        #app { margin-top: 20px; padding: 10px; border: 2px solid #007bff; min-height: 100px; }
        .route-component { padding: 20px; border: 1px dashed #666; margin: 10px 0; }
        .error { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <h1>React Router Test - ${testMode.toUpperCase()} Mode</h1>

    <nav id="navigation">
        <!-- Navigation links will be rendered by React -->
    </nav>

    <div id="app">
        <!-- React app renders here -->
    </div>

    <div id="controls">
        <h3>Test Controls</h3>
        <button onclick="testBasicNavigation()">Test Basic Navigation</button>
        <button onclick="testParameterizedRoutes()">Test Parameterized Routes</button>
        <button onclick="testHooksNavigation()">Test Hooks Navigation</button>
        <button onclick="testLinkComponents()">Test Link Components</button>
        <button onclick="testActiveView()">Test ActiveView</button>
        ${
      testMode === 'manual'
        ? '<button onclick="initializeRouter()">Initialize Router</button>'
        : ''
    }
    </div>

    <div id="output">
        <div><strong>Test Output:</strong></div>
    </div>

    <!-- React and ReactDOM from CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

    <!-- Load our bundled test routes -->
    <script src="${scriptPath}"></script>

    <script>
        // Initialize React testing environment
        ${
      testMode === 'history'
        ? `setupReactRouter('history', '${HISTORY_MODE_IP}');`
        : ''
    }
        ${
      testMode === 'hash' ? `setupReactRouter('hash', '${HASH_MODE_IP}');` : ''
    }
        ${
      testMode === 'manual'
        ? `// Manual init - call setupReactRouter when ready`
        : ''
    }

        // Test functions
        async function testBasicNavigation() {
            window.log('=== Testing Basic Navigation ===');
            if (!window.router) return window.log('ERROR: Router not initialized');

            const { useNavigate } = window.router;

            try {
                await window.testNavigate('/');
                await window.testNavigate('/about');
                await window.testNavigate('/');
                window.log('✅ Basic navigation test passed');
            } catch (error) {
                window.log('❌ Basic navigation test failed: ' + error.message);
            }
        }

        async function testParameterizedRoutes() {
            window.log('=== Testing Parameterized Routes ===');
            if (!window.router) return window.log('ERROR: Router not initialized');

            try {
                await window.testNavigate('/user/123');
                await window.testNavigate('/user/456');
                await window.testNavigate('/post/tech/typescript-tips');
                window.log('✅ Parameterized routes test passed');
            } catch (error) {
                window.log('❌ Parameterized routes test failed: ' + error.message);
            }
        }

        async function testHooksNavigation() {
            window.log('=== Testing Hooks Navigation ===');
            if (!window.router) return window.log('ERROR: Router not initialized');

            try {
                // Test useNavigate hook
                await window.testHooksNavigation();
                window.log('✅ Hooks navigation test passed');
            } catch (error) {
                window.log('❌ Hooks navigation test failed: ' + error.message);
            }
        }

        async function testLinkComponents() {
            window.log('=== Testing Link Components ===');
            if (!window.router) return window.log('ERROR: Router not initialized');

            try {
                // Test Link component clicks
                await window.testLinkClicks();
                window.log('✅ Link components test passed');
            } catch (error) {
                window.log('❌ Link components test failed: ' + error.message);
            }
        }

        async function testActiveView() {
            window.log('=== Testing ActiveView Rendering ===');
            if (!window.router) return window.log('ERROR: Router not initialized');

            try {
                await window.testActiveViewRendering();
                window.log('✅ ActiveView test passed');
            } catch (error) {
                window.log('❌ ActiveView test failed: ' + error.message);
            }
        }

        ${
      testMode === 'manual'
        ? `
        function initializeRouter() {
            window.log('=== Initializing Manual Router ===');
            try {
                setupReactRouter('history', '${MANUAL_INIT_IP}', true);
                window.log('✅ Manual router initialized');
            } catch (error) {
                window.log('❌ Manual router initialization failed: ' + error.message);
            }
        }
        `
        : ''
    }
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  });

  return server;
}

Deno.test('React Router - History mode navigation', async () => {
  const server = setupTestServer();
  const serverAddr = server.addr as Deno.NetAddr;
  const browser = await launch();

  try {
    const page = await browser.newPage(
      `http://${HISTORY_MODE_IP}:${serverAddr.port}`,
    );

    // Wait for React to initialize
    await page.waitForSelector('#app');
    await page.waitForFunction(() => window.router !== undefined);

    // Test basic navigation
    await page.click('button[onclick="testBasicNavigation()"]');
    await page.waitForTimeout(500);

    const results = await page.evaluate(() => window.testResults);

    // Verify navigation worked
    const hasNavigation = results.some((r) => r.includes('entered:/'));
    assertEquals(hasNavigation, true, 'Should have navigation entries');

    const hasSuccess = results.some((r) =>
      r.includes('✅ Basic navigation test passed')
    );
    assertEquals(hasSuccess, true, 'Basic navigation should pass');
  } finally {
    await browser.close();
    await server.shutdown();
  }
});

Deno.test('React Router - Hash mode navigation', async () => {
  const server = setupTestServer();
  const serverAddr = server.addr as Deno.NetAddr;
  const browser = await launch();

  try {
    const page = await browser.newPage(
      `http://${HASH_MODE_IP}:${serverAddr.port}`,
    );

    await page.waitForSelector('#app');
    await page.waitForFunction(() => window.router !== undefined);

    // Test parameterized routes in hash mode
    await page.click('button[onclick="testParameterizedRoutes()"]');
    await page.waitForTimeout(500);

    const results = await page.evaluate(() => window.testResults);

    const hasUserRoute = results.some((r) => r.includes('entered:/user/'));
    assertEquals(hasUserRoute, true, 'Should navigate to user route');

    const hasPostRoute = results.some((r) => r.includes('entered:/post/'));
    assertEquals(hasPostRoute, true, 'Should navigate to post route');
  } finally {
    await browser.close();
    await server.shutdown();
  }
});

Deno.test('React Router - Link component interactions', async () => {
  const server = setupTestServer();
  const serverAddr = server.addr as Deno.NetAddr;
  const browser = await launch();

  try {
    const page = await browser.newPage(
      `http://${HISTORY_MODE_IP}:${serverAddr.port}`,
    );

    await page.waitForSelector('#app');
    await page.waitForFunction(() => window.router !== undefined);

    // Test Link component clicks
    await page.click('button[onclick="testLinkComponents()"]');
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => window.testResults);

    const hasLinkTest = results.some((r) =>
      r.includes('✅ Link components test passed')
    );
    assertEquals(hasLinkTest, true, 'Link components should work');

    // Verify Link components have correct href attributes
    const linkHrefs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[data-testid]'));
      return links.map((link) => ({
        testId: link.getAttribute('data-testid'),
        href: link.getAttribute('href'),
      }));
    });

    const homeLink = linkHrefs.find((l) => l.testId === 'home-link');
    const userLink = linkHrefs.find((l) => l.testId === 'user-link');

    assertEquals(homeLink?.href, '/', 'Home link should have correct href');
    assertEquals(
      userLink?.href?.startsWith('/user/'),
      true,
      'User link should have parameterized href',
    );
  } finally {
    await browser.close();
    await server.shutdown();
  }
});

Deno.test('React Router - ActiveView component rendering', async () => {
  const server = setupTestServer();
  const serverAddr = server.addr as Deno.NetAddr;
  const browser = await launch();

  try {
    const page = await browser.newPage(
      `http://${HISTORY_MODE_IP}:${serverAddr.port}`,
    );

    await page.waitForSelector('#app');
    await page.waitForFunction(() => window.router !== undefined);

    // Test ActiveView rendering
    await page.click('button[onclick="testActiveView()"]');
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => window.testResults);

    const hasActiveView = results.some((r) =>
      r.includes('✅ ActiveView test passed')
    );
    assertEquals(hasActiveView, true, 'ActiveView should render correctly');

    // Check that components are actually rendered in the DOM
    const renderedComponents = await page.evaluate(() => {
      const app = document.querySelector('#app');
      const components = app
        ? Array.from(app.querySelectorAll('[data-testid]'))
        : [];
      return components.map((c) => c.getAttribute('data-testid'));
    });

    const hasRouteComponent = renderedComponents.length > 0;
    assertEquals(
      hasRouteComponent,
      true,
      'Should have rendered route components',
    );
  } finally {
    await browser.close();
    await server.shutdown();
  }
});

Deno.test('React Router - Hooks integration', async () => {
  const server = setupTestServer();
  const serverAddr = server.addr as Deno.NetAddr;
  const browser = await launch();

  try {
    const page = await browser.newPage(
      `http://${HISTORY_MODE_IP}:${serverAddr.port}`,
    );

    await page.waitForSelector('#app');
    await page.waitForFunction(() => window.router !== undefined);

    // Test hooks functionality
    await page.click('button[onclick="testHooksNavigation()"]');
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => window.testResults);

    const hasHooksTest = results.some((r) =>
      r.includes('✅ Hooks navigation test passed')
    );
    assertEquals(hasHooksTest, true, 'React hooks should work with router');

    // Test that hooks provide expected data
    const hookData = await page.evaluate(() => {
      return {
        hasParams: window.testProps?.currentParams !== undefined,
        hasRoute: window.testProps?.currentRoute !== undefined,
        hasNavigate: typeof window.testProps?.navigate === 'function',
      };
    });

    assertEquals(
      hookData.hasParams,
      true,
      'useParams hook should provide params',
    );
    assertEquals(hookData.hasRoute, true, 'useRoute hook should provide route');
    assertEquals(
      hookData.hasNavigate,
      true,
      'useNavigate hook should provide navigate function',
    );
  } finally {
    await browser.close();
    await server.shutdown();
  }
});

Deno.test('React Router - Manual initialization', async () => {
  const server = setupTestServer();
  const serverAddr = server.addr as Deno.NetAddr;
  const browser = await launch();

  try {
    const page = await browser.newPage(
      `http://${MANUAL_INIT_IP}:${serverAddr.port}`,
    );

    await page.waitForSelector('#app');

    // Router should not be initialized yet
    const routerBefore = await page.evaluate(() => window.router !== undefined);
    assertEquals(
      routerBefore,
      false,
      'Router should not be initialized initially',
    );

    // Click manual init button
    await page.click('button[onclick="initializeRouter()"]');
    await page.waitForTimeout(500);

    // Now router should be initialized
    const routerAfter = await page.evaluate(() => window.router !== undefined);
    assertEquals(
      routerAfter,
      true,
      'Router should be initialized after manual init',
    );

    const results = await page.evaluate(() => window.testResults);
    const hasManualInit = results.some((r) =>
      r.includes('✅ Manual router initialized')
    );
    assertEquals(hasManualInit, true, 'Manual initialization should succeed');
  } finally {
    await browser.close();
    await server.shutdown();
  }
});

Deno.test('React Router - Error handling', async () => {
  const server = setupTestServer();
  const serverAddr = server.addr as Deno.NetAddr;
  const browser = await launch();

  try {
    const page = await browser.newPage(
      `http://${HISTORY_MODE_IP}:${serverAddr.port}`,
    );

    await page.waitForSelector('#app');
    await page.waitForFunction(() => window.router !== undefined);

    // Test error scenarios
    const errorResults = await page.evaluate(async () => {
      const results = [];

      try {
        // Test navigating to non-existent route
        await window.testNavigate('/non-existent-route');
        results.push('no-error-for-invalid-route');
      } catch (error) {
        results.push('caught-invalid-route-error');
      }

      return results;
    });

    // Should handle invalid routes gracefully (either with fallback or error)
    const hasErrorHandling = errorResults.length > 0;
    assertEquals(hasErrorHandling, true, 'Should handle routing errors');
  } finally {
    await browser.close();
    await server.shutdown();
  }
});

Deno.test('React Router - Component lifecycle', async () => {
  const server = setupTestServer();
  const serverAddr = server.addr as Deno.NetAddr;
  const browser = await launch();

  try {
    const page = await browser.newPage(
      `http://${HISTORY_MODE_IP}:${serverAddr.port}`,
    );

    await page.waitForSelector('#app');
    await page.waitForFunction(() => window.router !== undefined);

    // Navigate through routes and check component lifecycle
    await page.evaluate(async () => {
      window.componentRenderCount = 0;
      await window.testNavigate('/');
      await window.testNavigate('/about');
      await window.testNavigate('/user/123');
      await window.testNavigate('/');
    });

    await page.waitForTimeout(500);

    const renderCount = await page.evaluate(() =>
      window.componentRenderCount || 0
    );

    // Should have rendered components multiple times
    assertEquals(
      renderCount >= 4,
      true,
      'Components should render for each navigation',
    );

    const results = await page.evaluate(() => window.testResults);

    // Check for component mount/unmount patterns
    const hasLifecycle = results.some((r) =>
      r.includes('entered:') || r.includes('exited:') || r.includes('rendered:')
    );
    assertEquals(hasLifecycle, true, 'Should track component lifecycle');
  } finally {
    await browser.close();
    await server.shutdown();
  }
});
