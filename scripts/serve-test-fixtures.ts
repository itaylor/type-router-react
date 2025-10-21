#!/usr/bin/env deno run --allow-net --allow-read

import {
  BASIC_ROUTING_IP,
  configMap,
  DEFAULT_PORT,
  HASH_MODE_IP,
  MANUAL_INIT_IP,
} from '../test-fixtures/server-config.ts';

interface ServerInstance {
  server: Deno.HttpServer;
  port: number;
}

function createTestFixtureServer(port: number = DEFAULT_PORT): ServerInstance {
  const controller = new AbortController();

  const server = Deno.serve({
    port,
    hostname: '0.0.0.0', // Listen on all interfaces
    signal: controller.signal,
  }, async (req) => {
    const url = new URL(req.url);
    const host = req.headers.get('host')?.split(':')[0] || '127.0.0.1';

    console.log(
      `${
        new Date().toISOString()
      } - ${req.method} ${url.pathname} from ${host}`,
    );

    // Serve bundled JavaScript files
    if (url.pathname.startsWith('/dist/')) {
      try {
        const filePath = `./test-fixtures${url.pathname}`;
        const content = await Deno.readTextFile(filePath);
        return new Response(content, {
          headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
        });
      } catch (error) {
        console.error(`Failed to serve JS file ${url.pathname}:`, error);
        return new Response('File not found', { status: 404 });
      }
    }

    // Serve HTML files based on IP mapping
    const htmlFile = configMap[host as keyof typeof configMap];
    if (!htmlFile) {
      console.warn(`No configuration found for IP: ${host}`);
      return new Response('No test fixture configured for this IP', {
        status: 404,
      });
    }

    try {
      const content = await Deno.readTextFile(`./test-fixtures/${htmlFile}`);
      return new Response(content, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    } catch (error) {
      console.error(`Failed to serve HTML file ${htmlFile}:`, error);
      return new Response('Demo not found', { status: 404 });
    }
  });

  const serverInfo = server.addr as Deno.NetAddr;

  return {
    server,
    port: serverInfo.port,
  };
}

function printServerInfo(serverInstance: ServerInstance) {
  console.log(
    `\n🚀 Test Fixture Server started on port ${serverInstance.port}\n`,
  );
  console.log('Available test fixtures:');
  console.log(
    `  📄 basic-routing: http://${BASIC_ROUTING_IP}:${serverInstance.port}`,
  );
  console.log(`  📄 hash-mode: http://${HASH_MODE_IP}:${serverInstance.port}`);
  console.log(
    `  📄 manual-init: http://${MANUAL_INIT_IP}:${serverInstance.port}`,
  );
  console.log('\nPress Ctrl+C to stop the server\n');
}

async function main() {
  try {
    const serverInstance = createTestFixtureServer();
    printServerInfo(serverInstance);

    // Handle graceful shutdown
    const handleShutdown = () => {
      console.log('\n🛑 Shutting down server...');
      Deno.exit(0);
    };

    // Listen for interrupt signals
    Deno.addSignalListener('SIGINT', handleShutdown);
    Deno.addSignalListener('SIGTERM', handleShutdown);

    // Keep the server running
    await serverInstance.server.finished;
  } catch (error) {
    console.error('Failed to start server:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
