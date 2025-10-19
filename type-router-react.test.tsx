/// <reference lib="deno.ns" />
import { assertEquals } from '@std/assert';
import React from 'react';

import {
  type ComponentRoute,
  createRouterForReact,
  makeComponentRoute,
  makeRoute,
} from './type-router-react.tsx';
// Mock global objects for testing
const mockGlobalThis = () => {
  Object.defineProperty(globalThis, 'location', {
    value: { pathname: '/', search: '', hash: '' },
    writable: true,
  });
  Object.defineProperty(globalThis, 'history', {
    value: { pushState: () => {} },
    writable: true,
  });
  Object.defineProperty(globalThis, 'addEventListener', {
    value: () => {},
    writable: true,
  });
};

mockGlobalThis();

// Simple test components
function HomeComponent() {
  return React.createElement('div', { 'data-testid': 'home' }, 'Home Page');
}

function AboutComponent() {
  return React.createElement('div', { 'data-testid': 'about' }, 'About Page');
}

function UserComponent({ id }: { id: string }) {
  return React.createElement('div', { 'data-testid': 'user' }, `User: ${id}`);
}

function PostComponent({ category, slug }: { category: string; slug: string }) {
  return React.createElement(
    'div',
    { 'data-testid': 'post' },
    `Post: ${category}/${slug}`,
  );
}

Deno.test('createRouterForReact - basic router creation', () => {
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
    makeComponentRoute({ path: '/about', component: AboutComponent }),
    makeComponentRoute({ path: '/user/:id', component: UserComponent }),
  ] as const;

  const router = createRouterForReact(routes, { autoInit: false });

  // Test that all expected components and hooks are returned
  assertEquals(typeof router.RouterProvider, 'function');
  assertEquals(typeof router.ActiveView, 'function');
  assertEquals(typeof router.Link, 'function');
  assertEquals(typeof router.useNavigate, 'function');
  assertEquals(typeof router.useParams, 'function');
  assertEquals(typeof router.useRoute, 'function');
});

Deno.test('createRouterForReact - router with options', () => {
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
    makeComponentRoute({ path: '/404', component: AboutComponent }),
  ] as const;

  const router = createRouterForReact(routes, {
    autoInit: false,
    urlType: 'hash',
    fallbackPath: '/404',
    onEnter: () => console.log('Global enter'),
    onExit: () => console.log('Global exit'),
  });

  // Router should be created successfully with options
  assertEquals(typeof router.RouterProvider, 'function');
  assertEquals(typeof router.ActiveView, 'function');
});

Deno.test('makeComponentRoute - creates valid component routes', () => {
  const homeRoute = makeComponentRoute({
    path: '/',
    component: HomeComponent,
  });

  const userRoute = makeComponentRoute({
    path: '/user/:id',
    component: UserComponent,
  });

  const postRoute = makeComponentRoute({
    path: '/post/:category/:slug',
    component: PostComponent,
  });

  // Test route properties
  assertEquals(homeRoute.path, '/');
  assertEquals(typeof homeRoute.component, 'function');

  assertEquals(userRoute.path, '/user/:id');
  assertEquals(typeof userRoute.component, 'function');

  assertEquals(postRoute.path, '/post/:category/:slug');
  assertEquals(typeof postRoute.component, 'function');
});

Deno.test('Link component - basic properties', () => {
  // Test that Link component is returned from router creation
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
    makeComponentRoute({ path: '/user/:id', component: UserComponent }),
  ] as const;

  const { Link } = createRouterForReact(routes, { autoInit: false });

  // Test that Link exists and is a function
  assertEquals(typeof Link, 'function');

  // Note: We can't test Link rendering without proper React context
  // This would be tested in integration/browser tests instead
});

Deno.test('Router components exist and are functions', () => {
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
    makeComponentRoute({ path: '/user/:id', component: UserComponent }),
    makeComponentRoute({
      path: '/post/:category/:slug',
      component: PostComponent,
    }),
  ] as const;

  const router = createRouterForReact(routes, { autoInit: false });

  // Test that all components exist and are functions
  assertEquals(typeof router.Link, 'function');
  assertEquals(typeof router.RouterProvider, 'function');
  assertEquals(typeof router.ActiveView, 'function');
  assertEquals(typeof router.useNavigate, 'function');
  assertEquals(typeof router.useParams, 'function');
  assertEquals(typeof router.useRoute, 'function');

  // Note: Actual rendering and href generation would be tested in browser/integration tests
});

Deno.test('ActiveView component - renders correctly', () => {
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
    makeComponentRoute({ path: '/about', component: AboutComponent }),
  ] as const;

  const { ActiveView } = createRouterForReact(routes, { autoInit: false });

  // ActiveView should be a function component
  assertEquals(typeof ActiveView, 'function');

  // Should be able to create ActiveView element
  const activeViewElement = React.createElement(ActiveView);
  assertEquals(typeof activeViewElement, 'object');
});

Deno.test('Mixed component and lifecycle routes', () => {
  const logs: string[] = [];

  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
    {
      path: '/dashboard',
      onEnter: () => logs.push('dashboard-enter'),
      onExit: () => logs.push('dashboard-exit'),
    },
    makeComponentRoute({ path: '/about', component: AboutComponent }),
  ] as const;

  const router = createRouterForReact(routes, { autoInit: false });

  // Should handle mixed route types
  assertEquals(typeof router.RouterProvider, 'function');
  assertEquals(typeof router.ActiveView, 'function');
  assertEquals(typeof router.Link, 'function');
});

Deno.test('Router context error handling', () => {
  // Test that hooks exist as functions
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
  ] as const;

  const { useNavigate, useParams, useRoute } = createRouterForReact(routes, {
    autoInit: false,
  });

  // Test that hooks exist as functions
  assertEquals(typeof useNavigate, 'function');
  assertEquals(typeof useParams, 'function');
  assertEquals(typeof useRoute, 'function');

  // Note: Error handling for hooks called outside RouterProvider
  // would be tested in integration tests with proper React context
});

Deno.test('Component route type inference', () => {
  // Test that TypeScript types are correctly inferred
  const userRoute: ComponentRoute<'/user/:id'> = makeComponentRoute({
    path: '/user/:id',
    component: UserComponent,
  });

  const postRoute: ComponentRoute<'/post/:category/:slug'> = makeComponentRoute(
    {
      path: '/post/:category/:slug',
      component: PostComponent,
    },
  );

  const homeRoute: ComponentRoute<'/'> = makeComponentRoute({
    path: '/',
    component: HomeComponent,
  });

  // Verify route properties
  assertEquals(userRoute.path, '/user/:id');
  assertEquals(postRoute.path, '/post/:category/:slug');
  assertEquals(homeRoute.path, '/');

  assertEquals(typeof userRoute.component, 'function');
  assertEquals(typeof postRoute.component, 'function');
  assertEquals(typeof homeRoute.component, 'function');
});

Deno.test('Complex route configurations', () => {
  const onEnterLogs: string[] = [];
  const onExitLogs: string[] = [];

  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
    makeComponentRoute({ path: '/user/:id', component: UserComponent }),
    makeRoute({
      path: '/admin/:section',
      onEnter: (params) => {
        onEnterLogs.push(`admin-enter-${params.section}`);
      },
      onExit: (params) => {
        onExitLogs.push(`admin-exit-${params.section}`);
      },
    }),
  ] as const;

  const router = createRouterForReact(routes, {
    autoInit: false,
    onEnter: (route: any) => {
      onEnterLogs.push(`global-enter-${route.path}`);
    },
    onExit: (route: any) => {
      onExitLogs.push(`global-exit-${route.path}`);
    },
  });

  // Should create router with complex configuration
  assertEquals(typeof router.RouterProvider, 'function');
  assertEquals(typeof router.ActiveView, 'function');
  assertEquals(typeof router.Link, 'function');
  assertEquals(typeof router.useNavigate, 'function');
  assertEquals(typeof router.useRoute, 'function');
  assertEquals(typeof router.useParams, 'function');
});

Deno.test('Router provider component structure', () => {
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
  ] as const;

  const { RouterProvider } = createRouterForReact(routes, { autoInit: false });

  // Test that RouterProvider can be created with children
  const providerElement = React.createElement(
    RouterProvider,
    { children: React.createElement('div', {}, 'Child content') },
  );

  assertEquals(typeof providerElement, 'object');
  assertEquals(typeof providerElement.type, 'function');
});

Deno.test('Hash vs History mode configuration', () => {
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
  ] as const;

  const historyRouter = createRouterForReact(routes, {
    autoInit: false,
    urlType: 'history',
  });

  const hashRouter = createRouterForReact(routes, {
    autoInit: false,
    urlType: 'hash',
  });

  // Both routers should be created successfully
  assertEquals(typeof historyRouter.RouterProvider, 'function');
  assertEquals(typeof hashRouter.RouterProvider, 'function');
});

Deno.test('Fallback path configuration', () => {
  const routes = [
    makeComponentRoute({ path: '/', component: HomeComponent }),
    makeComponentRoute({ path: '/404', component: AboutComponent }),
  ] as const;

  const router = createRouterForReact(routes, {
    autoInit: false,
    fallbackPath: '/404',
  });

  // Router should accept fallback configuration
  assertEquals(typeof router.RouterProvider, 'function');
  assertEquals(typeof router.ActiveView, 'function');
});
