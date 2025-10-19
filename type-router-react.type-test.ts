/// <reference lib="deno.ns" />
/**
 * TypeScript type inference tests for type-router-react
 *
 * This file tests that TypeScript types are correctly inferred and enforced
 * at compile time. It uses type assertions and intentional type errors
 * (commented out) to verify the type system is working as expected.
 */

import type { ParamsFor } from '../type-router/type-router.ts';
import {
  type ComponentRoute,
  createRouterForReact,
  makeComponentRoute,
  makeRoute,
} from './type-router-react.tsx';
// React types for component testing
const emptyObject = {};
type EmptyObject = typeof emptyObject;
type ReactComponent<P = EmptyObject> = (props: P) => any;

// ============================================================================
// Test Parameter Type Inference
// ============================================================================

// Simple route with single parameter
type UserParams = ParamsFor<'/user/:id'>;
const _userParams: UserParams = { id: 'test' };

// Route with multiple parameters
type PostParams = ParamsFor<'/post/:category/:slug'>;
const _postParams: PostParams = { category: 'tech', slug: 'typescript' };

// Route with no parameters
type HomeParams = ParamsFor<'/'>;
const _homeParams: HomeParams = {};

// Complex route with multiple segments
type ArticleParams = ParamsFor<'/article/:year/:month/:day/:slug'>;
const _articleParams: ArticleParams = {
  year: '2023',
  month: '12',
  day: '25',
  slug: 'christmas-post',
};

// ============================================================================
// Test Component Route Types
// ============================================================================

// Component type definitions that match route parameters
type UserComponent = ReactComponent<{ id: string }>;
type PostComponent = ReactComponent<{ category: string; slug: string }>;

// Valid component routes
const _validUserRoute: ComponentRoute<'/user/:id'> = {
  path: '/user/:id',
  component: {} as UserComponent,
};

const _validPostRoute: ComponentRoute<'/post/:category/:slug'> = {
  path: '/post/:category/:slug',
  component: {} as PostComponent,
};

// ============================================================================
// Test makeComponentRoute Function
// ============================================================================

// Should infer types correctly
const userRoute = makeComponentRoute({
  path: '/user/:id',
  component: {} as ReactComponent<{ id: string }>,
});

const postRoute = makeComponentRoute({
  path: '/post/:category/:slug',
  component: {} as ReactComponent<{ category: string; slug: string }>,
});

const homeRoute = makeComponentRoute({
  path: '/',
  component: {} as ReactComponent<EmptyObject>,
});

// Test that makeComponentRoute preserves literal types
const _routePath: '/user/:id' = userRoute.path;

// ============================================================================
// Test createRouterForReact Types
// ============================================================================

const routes = [
  homeRoute,
  userRoute,
  postRoute,
  makeComponentRoute({
    path: '/about',
    component: {} as ReactComponent<EmptyObject>,
  }),
] as const;

const router = createRouterForReact(routes, { autoInit: false });

// Test that router components exist and have correct types
const _RouterProvider: ReactComponent<{ children: any }> =
  router.RouterProvider;
const _ActiveView: ReactComponent = router.ActiveView;
const _Link: ReactComponent<any> = router.Link;

// Test hook types
type NavigateFunction = ReturnType<typeof router.useNavigate>;
type ParamsReturn = ReturnType<typeof router.useParams>;
type RouteReturn = ReturnType<typeof router.useRoute>;

// ============================================================================
// Test Link Component Props
// ============================================================================

// Test valid Link prop types (without JSX)
type ValidLinkProps1 = Parameters<typeof router.Link>[0] & { to: '/' };
type ValidLinkProps2 = Parameters<typeof router.Link>[0] & { to: '/about' };
type ValidLinkProps3 = Parameters<typeof router.Link>[0] & {
  to: '/user/:id';
  params: { id: string };
};
type ValidLinkProps4 = Parameters<typeof router.Link>[0] & {
  to: '/post/:category/:slug';
  params: { category: string; slug: string };
};

// ============================================================================
// Test Router with Mixed Route Types
// ============================================================================

const mixedRoutes = [
  makeComponentRoute({
    path: '/',
    component: {} as ReactComponent<EmptyObject>,
  }),
  {
    path: '/dashboard',
    onEnter: () => console.log('Dashboard entered'),
    onExit: () => console.log('Dashboard exited'),
  },
  makeComponentRoute({
    path: '/user/:id',
    component: {} as ReactComponent<{ id: string }>,
  }),
] as const;

const mixedRouter = createRouterForReact(mixedRoutes, { autoInit: false });

// Should work with mixed route types
const _mixedRouterProvider = mixedRouter.RouterProvider;
const _mixedActiveView = mixedRouter.ActiveView;

// ============================================================================
// Test Router Options Types
// ============================================================================

const _routerWithOptions = createRouterForReact(routes, {
  urlType: 'hash',
  fallbackPath: '/about',
  autoInit: false,
  onEnter: (route, params) => {
    // Test that route and params are properly typed
    const _routePath: string = route.path;
    const _params: Record<string, string> = params || {};
  },
  onExit: (route, params) => {
    const _routePath: string = route.path;
    const _params: Record<string, string> = params || {};
  },
  onMiss: (path: string) => {
    console.log('No route found for:', path);
  },
});

// ============================================================================
// Test Navigation Function Types
// ============================================================================

function _TestNavigationTypes() {
  const navigate = router.useNavigate();
  const params = router.useParams();
  const route = router.useRoute();

  // Test navigate function types
  const _testNavigation = async () => {
    // Should accept concrete paths
    await navigate('/');
    await navigate('/about');

    // Should accept parameterized paths with params
    await navigate('/user/:id', { id: '123' });
    await navigate('/post/:category/:slug', {
      category: 'tech',
      slug: 'typescript',
    });
  };

  // Test that params have correct type
  const _paramsType: Record<string, string> = params;

  // Test route state type
  const _routeType: {
    path: string | null;
    params: Record<string, string>;
    route: any | null;
  } = route;

  return null;
}

// ============================================================================
// Test ActiveView Rendering Types
// ============================================================================

// Test that ActiveView renders correctly (type-only test)
type TestActiveViewTypes = {
  RouterProvider: typeof router.RouterProvider;
  ActiveView: typeof router.ActiveView;
  Link: typeof router.Link;
};

// ============================================================================
// Test Component Props Inference
// ============================================================================

// Test that component props are correctly inferred from route parameters
// Test Component Props Inference Types
type TestComponentProps = {
  // These should compile without errors
  userComp: ReturnType<typeof makeComponentRoute<'/user/:id'>>;
  postComp: ReturnType<typeof makeComponentRoute<'/blog/:year/:month/:slug'>>;
  noParamsComp: ReturnType<typeof makeComponentRoute<'/about'>>;
};

// ============================================================================
// Test Error Cases (These should cause TypeScript errors when uncommented)
// ============================================================================

/*
// ❌ Should error: missing required params
const _errorLink1 = <router.Link to="/user/:id">User</router.Link>;

// ❌ Should error: wrong param name
const _errorLink2 = <router.Link to="/user/:id" params={{ wrong: '123' }}>User</router.Link>;

// ❌ Should error: missing params for navigation
const _errorNavigation = async () => {
  const navigate = router.useNavigate();
  await navigate('/user/:id'); // Missing params
};

// ❌ Should error: component props don't match route params
const _errorComponent = makeComponentRoute({
  path: '/user/:id',
  component: ({ wrong }: { wrong: string }) => <div>{wrong}</div>,
});

// ❌ Should error: invalid route path in Link
const _errorInvalidRoute = <router.Link to="/nonexistent">Invalid</router.Link>;

// ❌ Should error: fallback path must be concrete and exist in routes
const _errorRouter = createRouterForReact(routes, {
  fallbackPath: '/nonexistent', // Doesn't exist in routes
});

const _errorRouter2 = createRouterForReact(routes, {
  fallbackPath: '/user/:id', // Parameterized route not allowed as fallback
});
*/

// ============================================================================
// Test Complex Route Combinations
// ============================================================================

const complexRoutes = [
  makeComponentRoute({
    path: '/',
    component: {} as ReactComponent<EmptyObject>,
  }),
  makeComponentRoute({
    path: '/user/:userId/profile',
    component: {} as ReactComponent<{ userId: string }>,
  }),
  makeComponentRoute({
    path: '/user/:userId/posts/:postId',
    component: {} as ReactComponent<{ userId: string; postId: string }>,
  }),
  makeRoute({
    path: '/admin/:section' as const,
    onEnter: (params) => {
      // Params should be inferred as { section: string }
      const _section: string = params.section;
      // @ts-expect-error This param is not declared in the path
      const _userId: string = params.userId;
    },
  }),
] as const;

const complexRouter = createRouterForReact(complexRoutes, {
  fallbackPath: '/',
  autoInit: false,
});

// Test complex navigation types
type TestComplexNavigation = {
  navigate: ReturnType<typeof complexRouter.useNavigate>;
  validCall1: Parameters<ReturnType<typeof complexRouter.useNavigate>>;
  validCall2: Parameters<ReturnType<typeof complexRouter.useNavigate>>;
};

// ============================================================================
// Export types for external testing
// ============================================================================

export type { ComponentRoute, ParamsFor };

export { createRouterForReact, makeComponentRoute };

// Deno test that this file compiles without errors
Deno.test('Type definitions compile correctly', () => {
  // If this test runs, it means all the types above compiled successfully
  console.log('✅ All TypeScript types are correctly defined and inferred');
});
