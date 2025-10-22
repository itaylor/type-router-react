import type {
  ConcretePathForUnion,
  Options,
  ParamsFor,
  Route,
  RoutePath,
  Router,
  ValidatePath,
  WithOptionalTrailingSlash,
} from '../type-router/type-router.ts';
import { createRouter } from '../type-router/type-router.ts';
export { makeRoute } from '../type-router/type-router.ts';
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

type RouterContextValue<R extends readonly ReactRoutes[]> = {
  router: Router<R>;
  activeViewComponent: React.FC<ParamsFor<R[number]['path']>> | null;
  setActiveViewComponent: React.Dispatch<
    React.SetStateAction<React.FC<ParamsFor<R[number]['path']>> | null>
  >;
  urlType: 'hash' | 'history';
};
export type ComponentRoute<P extends string> = {
  path: P;
  component: React.FC<ParamsFor<P>>;
};
type ReactRoutes = Route<string> | ComponentRoute<string>;

export function createRouterForReact<const R extends readonly ReactRoutes[]>(
  routes: R,
  options: Partial<Options<R>>,
) {
  type Path = R[number]['path'];
  let setActiveViewComponentOuter: React.Dispatch<
    React.SetStateAction<React.FC<ParamsFor<R[number]['path']>> | null>
  >;
  let initialActiveViewComponent:
    | React.FC<ParamsFor<R[number]['path']>>
    | null = null;
  const realizedRoutes = realizeComponentRoutes(routes);
  const urlType = options.urlType || 'hash'; // Default to hash mode
  const router = createRouter<R>(realizedRoutes, {
    ...options,
    urlType,
    autoInit: false,
  });
  const RouterContext = createContext<RouterContextValue<R> | null>(null);

  function RouterProvider({ children }: { children: React.ReactNode }) {
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
    component: React.FC<ParamsFor<R[number]['path']>> | null,
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
              route.component as React.FC<ParamsFor<R[number]['path']>>,
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

  type LinkPropsConcrete<S extends string> = LinkBase & {
    to: ValidatePath<ConcretePathForUnion<RoutePath<R>, S>>;
  };

  type LinkPropsParams<P extends WithOptionalTrailingSlash<RoutePath<R>>> =
    & LinkBase
    & {
      to: P;
      params?: ParamsFor<P>;
    };

  // type LinkBase = React.ReactHTMLElement<HTMLAnchorElement>['props'] & {
  type LinkBase = ComponentPropsWithoutRef<'a'> & {
    className?: string;
    activeClassName?: string;
    children?: React.ReactNode;
    activeComparisonType?: ActiveComparisonType;
  };

  function Link<P extends WithOptionalTrailingSlash<RoutePath<R>>>(
    props: LinkPropsParams<P>,
  ): ReactNode;
  function Link<S extends string>(props: LinkPropsConcrete<S>): ReactNode;
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
      (e: React.MouseEvent<HTMLAnchorElement>) => {
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
  component: React.FC<ParamsFor<P>>;
}) {
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
