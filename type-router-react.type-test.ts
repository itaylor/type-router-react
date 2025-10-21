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

// ============================================================================
// Test Error Cases with @ts-expect-error
// ============================================================================

// Test Link component with missing required params
// @ts-expect-error - Should error: missing required params for parameterized route
const _errorLink1 = router.Link({ to: '/user/:id', children: 'User' });

// Test Link component with wrong param names
// @ts-expect-error - Should error: wrong param name 'userId' instead of 'id'
const _errorLink2 = router.Link({
  to: '/user/:id',
  params: { userId: '123' },
  children: 'User'
});

// Test Link component with extra params not in route
// @ts-expect-error - Should error: 'extra' param not defined in route
const _errorLink3 = router.Link({
  to: '/user/:id',
  params: { id: '123', extra: 'value' },
  children: 'User'
});

// Test navigation with missing params
// @ts-expect-error - Should error: missing required params for parameterized route
const _errorNavigation1 = async () => {
  const navigate = router.useNavigate();
  await navigate('/user/:id'); // Missing params
};

// Test navigation with wrong param types
// @ts-expect-error - Should error: 'id' should be string, not number
const _errorNavigation2 = async () => {
  const navigate = router.useNavigate();
  await navigate('/user/:id', { id: 123 });
};

// Test navigation with wrong param names
// @ts-expect-error - Should error: wrong param name 'userId' instead of 'id'
const _errorNavigation3 = async () => {
  const navigate = router.useNavigate();
  await navigate('/user/:id', { userId: '123' });
};

// Test navigation to non-existent route
// @ts-expect-error - Should error: route '/nonexistent' doesn't exist in routes
const _errorNavigation4 = async () => {
  const navigate = router.useNavigate();
  await navigate('/nonexistent');
};

// Test component with props that don't match route params
// @ts-expect-error - Should error: component expects 'wrong' but route provides 'id'
const _errorComponent1 = makeComponentRoute({
  path: '/user/:id',
  component: ({ wrong }: { wrong: string }) => <div>{wrong}</div>,
});

// Test component with missing required props
// @ts-expect-error - Should error: component doesn't accept 'id' param from route
const _errorComponent2 = makeComponentRoute({
  path: '/user/:id',
  component: () => <div>No props</div>,
});

// Test component with wrong prop types
// @ts-expect-error - Should error: 'id' should be string, not number
const _errorComponent3 = makeComponentRoute({
  path: '/user/:id',
  component: ({ id }: { id: number }) => <div>{id}</div>,
});

// Test router with invalid fallback path (doesn't exist in routes)
// @ts-expect-error - Should error: fallback path must exist in routes
const _errorRouter1 = createRouterForReact(routes, {
  fallbackPath: '/nonexistent',
});

// Test router with parameterized fallback path
// @ts-expect-error - Should error: fallback path cannot be parameterized
const _errorRouter2 = createRouterForReact(routes, {
  fallbackPath: '/user/:id',
});

// Test router with wrong urlType
// @ts-expect-error - Should error: urlType must be 'history' or 'hash'
const _errorRouter3 = createRouterForReact(routes, {
  urlType: 'browser',
});

// Test makeComponentRoute with mismatched types
// @ts-expect-error - Should error: path and component props don't match
const _errorMakeRoute1 = makeComponentRoute({
  path: '/post/:category/:slug',
  component: ({ id }: { id: string }) => <div>{id}</div>,
});

// Test Link to concrete path but wrong type
// @ts-expect-error - Should error: '/users' is not a valid route (should be '/user/:id')
const _errorLink4 = router.Link({ to: '/users', children: 'Users' });

// Test complex route with missing params
// @ts-expect-error - Should error: missing 'slug' param for '/post/:category/:slug'
const _errorLink5 = router.Link({
  to: '/post/:category/:slug',
  params: { category: 'tech' },
  children: 'Post'
});

// Test navigation with extra params
// @ts-expect-error - Should error: 'extra' is not a valid param for this route
const _errorNavigation5 = async () => {
  const navigate = router.useNavigate();
  await navigate('/about', { extra: 'value' });
};

// Test component route with no path parameter but component expects params
// @ts-expect-error - Should error: route has no params but component expects 'id'
const _errorComponent4 = makeComponentRoute({
  path: '/about',
  component: ({ id }: { id: string }) => <div>{id}</div>,
});

// Test multiple parameter route with some missing
// @ts-expect-error - Should error: missing 'month', 'day', 'slug' params
const _errorArticleNav = async () => {
  const navigate = router.useNavigate();
  await navigate('/article/:year/:month/:day/:slug', { year: '2023' });
};

// Test Link with wrong activeClassName type
// @ts-expect-error - Should error: activeClassName should be string, not number
const _errorLink6 = router.Link({
  to: '/',
  activeClassName: 123,
  children: 'Home'
});

// Test makeComponentRoute with invalid path
// @ts-expect-error - Should error: path must be a string literal type
const _errorMakeRoute2 = makeComponentRoute({
  path: 123 as any,
  component: () => <div>Test</div>,
});

// Test navigation with null params object
// @ts-expect-error - Should error: params object cannot be null when required
const _errorNavigation6 = async () => {
  const navigate = router.useNavigate();
  await navigate('/user/:id', null as any);
};

// Test component with optional param treated as required
// @ts-expect-error - Should error: component requires 'id' but route might not provide it
const _errorOptionalParam = makeComponentRoute({
  path: '/profile/:id?', // Optional param
  component: ({ id }: { id: string }) => <div>{id.toUpperCase()}</div>,
});

// Test Link params with undefined values
// @ts-expect-error - Should error: param values cannot be undefined
const _errorLink7 = router.Link({
  to: '/user/:id',
  params: { id: undefined as any },
  children: 'User'
});

// Test creating router with duplicate paths
// @ts-expect-error - Should error: duplicate route paths not allowed
const _duplicateRoutes = [
  makeComponentRoute({ path: '/', component: () => <div>Home 1</div> }),
  makeComponentRoute({ path: '/', component: () => <div>Home 2</div> }),
] as const;

// Test router creation with invalid routes array
// @ts-expect-error - Should error: routes must be an array
const _errorRoutes = createRouterForReact('not-an-array' as any, {});

// Test Link with both 'to' and 'href' props
// @ts-expect-error - Should error: cannot have both 'to' and 'href'
const _errorLink8 = router.Link({
  to: '/',
  href: '/external' as any,
  children: 'Home'
});

// Test useParams in wrong component context
// This would be a runtime error, but TypeScript should warn about hooks usage
const _testHooksUsage = () => {
  // @ts-expect-error - Should error: hooks must be called within component
  const params = router.useParams();
  return params;
};

// Test router with onEnter callback having wrong signature
// @ts-expect-error - Should error: onEnter callback has wrong parameter types
const _errorRouter4 = createRouterForReact(routes, {
  onEnter: (wrongParam: number) => console.log(wrongParam),
});

// Test makeComponentRoute with function component that returns wrong type
// @ts-expect-error - Should error: component must return ReactNode
const _errorComponent5 = makeComponentRoute({
  path: '/test',
  component: () => 123, // Should return ReactNode, not number
});*/

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
