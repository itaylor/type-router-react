import type {
  ConcretePathForUnion,
  Options,
  ParamsFor,
  Route,
  RoutePath,
  Router,
  RouteState,
  ValidatePath,
  WithOptionalTrailingSlash,
} from '../type-router/type-router.ts';
import { createRouter } from '../type-router/type-router.ts';
export { makeRoute } from '../type-router/type-router.ts';
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type React from 'react';

type RouterContextValue<R extends readonly Route<string>[]> = {
  router: Router<R>;
  currentRoute: RouteState<R>;
  activeViewComponent: React.FC<ParamsFor<R[number]['path']>> | null;
  setActiveViewComponent: React.Dispatch<
    React.SetStateAction<React.FC<ParamsFor<R[number]['path']>> | null>
  >;
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
  const router = createRouter<R>(realizedRoutes, {
    ...options,
    autoInit: false,
  });
  const RouterContext = createContext<RouterContextValue<R> | null>(null);

  function RouterProvider({ children }: { children: React.ReactNode }) {
    const [currentRoute, setCurrentRoute] = useState(router.getState());
    const [activeViewComponent, setActiveViewComponent] = useState<
      RouterContextValue<R>['activeViewComponent'] | null
    >(initialActiveViewComponent);
    setActiveViewComponentOuter = setActiveViewComponent;
    const contextValue = useMemo(
      () => ({
        router,
        activeViewComponent,
        setActiveViewComponent,
        currentRoute,
      }),
      [router, activeViewComponent, currentRoute],
    );

    useEffect(() => {
      const unsub = router.subscribe(setCurrentRoute);
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
            setActiveViewComponentInitial(route.component);
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
    const rc = useRouteContext();
    return rc.currentRoute;
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

  function ActiveView() {
    const rc = useRouteContext();
    const { params } = rc.currentRoute;
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
    ...rest
  }: any): ReactNode {
    const navigate = useNavigate();
    const rc = useRouteContext();
    const href = rc.router.computePath(to, params);
    const isActive = rc.router.pathMatchesCurrentRoute(to);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Only prevent default for unmodified left clicks
      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        navigate(href);
      }
    };
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
