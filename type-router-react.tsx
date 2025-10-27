import type {
  ConcretePathForUnion,
  FindFullRouteForPath,
  IsValidPathOnly,
  Options,
  ParamsFor,
  ParamsForPathOnly,
  PathOnly,
  Route,
  RoutePath,
  Router,
  ValidatePath,
  WithOptionalTrailingSlash,
} from '@itaylor/type-router';
import { createRouter } from '@itaylor/type-router';
export { makeRoute } from '@itaylor/type-router';
// These are needed because dnt does not support the newest JSX yet,
// and needs React to be imported.
// deno-lint-ignore verbatim-module-syntax no-unused-vars
import React, {
  type ComponentPropsWithoutRef,
  createContext,
  type Dispatch,
  type FC,
  type MouseEvent,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

type RouterContextValue<R extends readonly ReactRoutes[]> = {
  router: Router<R>;
  activeViewComponent: FC<ParamsFor<R[number]['path']>> | null;
  setActiveViewComponent: Dispatch<
    SetStateAction<FC<ParamsFor<R[number]['path']>> | null>
  >;
  urlType: 'hash' | 'history';
};
export type ComponentRoute<P extends string> = {
  path: P;
  component: FC<ParamsFor<P>>;
};
type ReactRoutes = Route<string> | ComponentRoute<string>;

interface RouterForReactReturn<R extends readonly ReactRoutes[]> {
  Link: {
    <P extends WithOptionalTrailingSlash<RoutePath<R>>>(
      props: ComponentPropsWithoutRef<'a'> & {
        className?: string;
        activeClassName?: string;
        children?: ReactNode;
        activeComparisonType?: 'none' | 'auto' | 'ancestor';
        to: ValidatePath<P>;
        params: ParamsFor<P>;
      },
    ): ReactNode;
    <S extends string>(
      props: ComponentPropsWithoutRef<'a'> & {
        className?: string;
        activeClassName?: string;
        children?: ReactNode;
        activeComparisonType?: 'none' | 'auto' | 'ancestor';
        to: ValidatePath<ConcretePathForUnion<RoutePath<R>, S>>;
      },
    ): ReactNode;
    <P extends WithOptionalTrailingSlash<PathOnly<RoutePath<R>>>>(
      props: ComponentPropsWithoutRef<'a'> & {
        className?: string;
        activeClassName?: string;
        children?: ReactNode;
        activeComparisonType?: 'none' | 'auto' | 'ancestor';
        to: ValidatePath<P>;
        params: IsValidPathOnly<P, R> extends true ? ParamsForPathOnly<P, R>
          : never;
      },
    ): ReactNode;
    <S extends string>(
      props: ComponentPropsWithoutRef<'a'> & {
        className?: string;
        activeClassName?: string;
        children?: ReactNode;
        activeComparisonType?: 'none' | 'auto' | 'ancestor';
        to: ValidatePath<ConcretePathForUnion<PathOnly<RoutePath<R>>, S>>;
        params: ParamsFor<FindFullRouteForPath<S, RoutePath<R>>>;
      },
    ): ReactNode;
  };
  ActiveView: () => ReactNode;
  RouterProvider: ({ children }: { children: ReactNode }) => ReactNode;
  useNavigate: () => Router<R>['navigate'];
  useParams: () => ParamsFor<RoutePath<R>>;
  useRoute: () => ReturnType<Router<R>['getState']>;
}

export function createRouterForReact<const R extends readonly ReactRoutes[]>(
  routes: R,
  options: Partial<Options<R>>,
): RouterForReactReturn<R> {
  type Path = R[number]['path'];
  let setActiveViewComponentOuter: Dispatch<
    SetStateAction<FC<ParamsFor<R[number]['path']>> | null>
  >;
  let initialActiveViewComponent:
    | FC<ParamsFor<R[number]['path']>>
    | null = null;
  const realizedRoutes = realizeComponentRoutes(routes);
  const urlType = options.urlType || 'hash'; // Default to hash mode
  const router = createRouter<R>(realizedRoutes, {
    ...options,
    urlType,
    autoInit: false,
  });
  const RouterContext = createContext<RouterContextValue<R> | null>(null);

  function RouterProvider({ children }: { children: ReactNode }) {
    const [activeViewComponent, setActiveViewComponent] = useState<
      RouterContextValue<R>['activeViewComponent'] | null
    >(initialActiveViewComponent);
    setActiveViewComponentOuter = setActiveViewComponent;
    const contextValue = useMemo(
      () => ({
        router,
        activeViewComponent,
        setActiveViewComponent,
        urlType,
      }),
      [router, activeViewComponent, urlType],
    );

    useEffect(() => {
      // Normalize hash for hash mode routing
      if (urlType === 'hash') {
        const currentHash = window.location.hash;
        if (!currentHash || currentHash === '#') {
          window.location.hash = '#/';
        }
      }

      const unsub = router.subscribe(() => {});
      router.init();
      return unsub;
    }, [router]);
    return (
      <RouterContext.Provider value={contextValue}>
        {children}
      </RouterContext.Provider>
    );
  }

  function setActiveViewComponentInitial(
    component: FC<ParamsFor<R[number]['path']>> | null,
  ) {
    if (setActiveViewComponentOuter) {
      // React useState set functions require you to pass a function with a wrapper
      setActiveViewComponentOuter(() => component);
    } else {
      initialActiveViewComponent = component;
    }
  }

  function realizeComponentRoutes(routes: R): R {
    return routes.map((route) => {
      if ('component' in route) {
        return {
          path: route.path,
          onEnter: () => {
            setActiveViewComponentInitial(
              route.component as FC<ParamsFor<R[number]['path']>>,
            );
          },
          onExit: () => {
            setActiveViewComponentInitial(null);
          },
        };
      }
      return route;
    }) as unknown as R;
  }

  function useRouteContext() {
    const rc = useContext(RouterContext);
    if (!rc) {
      throw new Error('useRouteContext must be used within RouterProvider');
    }
    return rc;
  }

  function useRoute() {
    const { router } = useRouteContext();
    return useSyncExternalStore(
      (callback) => router.subscribe(callback),
      () => router.getState(),
      () => router.getState(),
    );
  }

  function useNavigate() {
    const rc = useRouteContext();
    return rc.router.navigate;
  }

  // Hook to get current params
  function useParams() {
    const rc = useRoute();
    return rc.params;
  }

  type ActiveComparisonType = 'none' | 'auto' | 'ancestor';
  // Hook to efficiently check if a specific path is active
  function useIsActive<P extends RoutePath<R>>(
    path: ValidatePath<P>,
    comparisonType: ActiveComparisonType = 'auto',
  ) {
    const routeState = useRoute();
    if (comparisonType === 'none') {
      return false;
    }
    if (comparisonType === 'auto') {
      if (path.includes(':')) {
        return routeState.route?.path === path;
      } else {
        return routeState.path === path;
      }
    }
    if (comparisonType === 'ancestor') {
      if (path.includes(':')) {
        return isPathAncestor(routeState?.route?.path, path);
      } else {
        return isPathAncestor(routeState?.path, path);
      }
    }
    return false;
  }

  function ActiveView() {
    const rc = useRouteContext();
    const currentRoute = useRoute();
    const { params } = currentRoute;
    const ActiveViewComponent = rc.activeViewComponent;
    if (ActiveViewComponent === null || params === null) return null;
    return <ActiveViewComponent {...params} />;
  }

  type LinkBase = ComponentPropsWithoutRef<'a'> & {
    className?: string;
    activeClassName?: string;
    children?: ReactNode;
    activeComparisonType?: ActiveComparisonType;
  };

  /*
   * Link Component Overloads - Mirror NavigateFn Type Restrictions
   *
   * The Link component now implements 4 overloads that mirror the navigate() function's
   * type restrictions to provide consistent type safety:
   *
   * 1. Full route path with required params - for routes like '/user/:id'
   *    Requires `params` prop with correct parameter types
   *
   * 2. Concrete path with no params - for concrete paths like '/about'
   *    No `params` prop needed or allowed
   *
   * 3. Path-only with conditional params - for path-only patterns
   *    Conditionally requires params based on route existence
   *
   * 4. Concrete path-only with required params - for concrete path patterns
   *    Requires params matching the full route definition
   *
   * This provides the same type safety as navigate() including:
   * - Parameter name validation (e.g. 'id' not 'userId')
   * - Required parameter enforcement for parameterized routes
   * - Prevention of extra/invalid parameters
   * - Proper TypeScript errors for type violations
   */

  // Overload 1: Full route path with params
  function Link<P extends WithOptionalTrailingSlash<RoutePath<R>>>(
    props: LinkBase & {
      to: ValidatePath<P>;
      params: ParamsFor<P>;
    },
  ): ReactNode;

  // Overload 2: Concrete path (no params required)
  function Link<S extends string>(
    props: LinkBase & {
      to: ValidatePath<ConcretePathForUnion<RoutePath<R>, S>>;
    },
  ): ReactNode;

  // Overload 3: Path-only with conditional params
  function Link<P extends WithOptionalTrailingSlash<PathOnly<RoutePath<R>>>>(
    props: LinkBase & {
      to: ValidatePath<P>;
      params: IsValidPathOnly<P, R> extends true ? ParamsForPathOnly<P, R>
        : never;
    },
  ): ReactNode;

  // Overload 4: Concrete path-only with params
  function Link<S extends string>(
    props: LinkBase & {
      to: ValidatePath<ConcretePathForUnion<PathOnly<RoutePath<R>>, S>>;
      params: ParamsFor<FindFullRouteForPath<S, RoutePath<R>>>;
    },
  ): ReactNode;

  function Link<P extends Path>({
    to,
    params,
    children,
    className = '',
    activeClassName,
    activeComparisonType = 'auto',
    ...rest
  }: any): ReactNode {
    const { router, urlType } = useRouteContext();
    const navigate = router.navigate;
    const computedPath = router.computePath(to, params);
    const href = urlType === 'hash' ? `#${computedPath}` : computedPath;
    const isActive = useIsActive(to, activeComparisonType);

    const handleClick = useCallback(
      (e: MouseEvent<HTMLAnchorElement>) => {
        // Only prevent default for unmodified left clicks
        if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          navigate(computedPath);
        }
      },
      [navigate, computedPath],
    );

    return (
      <a
        {...rest}
        href={href}
        onClick={handleClick}
        className={isActive
          ? `${className} ${activeClassName || ''}`.trim()
          : className}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
      </a>
    );
  }
  return { Link, ActiveView, RouterProvider, useNavigate, useParams, useRoute };
}

export function makeComponentRoute<P extends string>(componentRoute: {
  path: P;
  component: FC<ParamsFor<P>>;
}): {
  path: P;
  component: FC<ParamsFor<P>>;
} {
  return componentRoute;
}

// Helper function for safe path segment matching
function isPathAncestor(
  currentPath: Maybe<string>,
  ancestorPath: Maybe<string>,
): boolean {
  if (!currentPath || !ancestorPath) return false;
  return currentPath === ancestorPath ||
    currentPath.startsWith(
      ancestorPath.endsWith('/') ? ancestorPath : ancestorPath + '/',
    );
}

type Maybe<T> = T | undefined | null;
