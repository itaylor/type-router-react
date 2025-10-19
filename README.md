# type-router-react

React bindings for type-router - A lightweight, type-safe router with
first-class TypeScript support. Zero dependencies beyond React, full type
inference, and a simple but powerful API designed for React applications.

## Features

- 🎯 **100% Type-Safe**: Full TypeScript support with automatic parameter type
  inference
- ⚛️ **React Integration**: First-class React hooks, components, and patterns
- 🪶 **Lightweight**: Zero dependencies beyond React, ~3KB minified
- 🔄 **Flexible Routing**: Support for both hash-based and history-based routing
- 🧩 **Component Routes**: Define routes with React components for automatic
  rendering
- 🪝 **React Hooks**: useNavigate, useParams, useRoute for seamless integration
- 🎨 **Link Component**: Type-safe navigation with active state support
- 📦 **Simple API**: Intuitive and minimal API surface
- ⚡ **Fast**: Efficient regex-based route matching
- 🔀 **Async Navigation**: Consistent async behavior across routing modes

## Installation

### From JSR

```bash
# Deno
deno add @itaylor/type-router-react

# npm (use any of npx, yarn dlx, pnpm dlx, or bunx)
npx jsr add @itaylor/type-router-react
```

### From npm

```bash
npm install @itaylor/type-router-react
# or
yarn add @itaylor/type-router-react
# or
pnpm add @itaylor/type-router-react
```

## Quick Start

```tsx
import React from 'react';
import {
  createRouterForReact,
  makeComponentRoute,
} from '@itaylor/type-router-react';

// Define components for your routes
function Home() {
  return <div>Welcome to the home page!</div>;
}

function About() {
  return <div>About us</div>;
}

function UserProfile({ id }: { id: string }) {
  return <div>User profile for: {id}</div>;
}

// Create the router with components
const { RouterProvider, Link, ActiveView, useNavigate, useParams } =
  createRouterForReact(
    [
      makeComponentRoute({ path: '/', component: Home }),
      makeComponentRoute({ path: '/about', component: About }),
      makeComponentRoute({ path: '/user/:id', component: UserProfile }),
    ] as const,
    {},
  );

// Your main App component
function App() {
  return (
    <RouterProvider>
      <nav>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
        <Link to='/user/:id' params={{ id: '123' }}>User 123</Link>
      </nav>

      <main>
        <ActiveView />
      </main>
    </RouterProvider>
  );
}

// Navigation from components
function NavigationExample() {
  const navigate = useNavigate();
  const params = useParams();

  const handleClick = async () => {
    await navigate('/user/456');
  };

  return (
    <div>
      <p>Current params: {JSON.stringify(params)}</p>
      <button onClick={handleClick}>Go to User 456</button>
    </div>
  );
}
```

## Core Concepts

### Component Routes vs Lifecycle Routes

You can define routes in two ways:

```tsx
import {
  createRouterForReact,
  makeComponentRoute,
  makeRoute,
} from '@itaylor/type-router-react';

// Component routes - automatically render components
const componentRoutes = [
  makeComponentRoute({
    path: '/',
    component: Home,
  }),
  makeComponentRoute({
    path: '/user/:id',
    component: UserProfile,
  }),
] as const;

// Or mix with lifecycle routes for custom behavior
const mixedRoutes = [
  makeComponentRoute({ path: '/', component: Home }),
  makeRoute({
    path: '/dashboard/:section',
    onEnter: (params) => {
      console.log(`Entering dashboard section: ${params.section}`);
      // Custom logic here
    },
    onExit: (params) => {
      console.log(`Leaving dashboard section: ${params.section}`);
    },
  }),
] as const;

const router = createRouterForReact(mixedRoutes, {});
```

### React Components and Hooks

The router provides several React-specific utilities:

```tsx
function MyComponent() {
  // Get current route state
  const route = useRoute();

  // Get current parameters
  const params = useParams();

  // Get navigation function
  const navigate = useNavigate();

  const handleNavigation = async () => {
    await navigate('/user/123');
  };

  return (
    <div>
      <p>Current path: {route.path}</p>
      <p>Params: {JSON.stringify(params)}</p>
      <button onClick={handleNavigation}>Navigate</button>
    </div>
  );
}
```

### Link Component

The Link component provides type-safe navigation with active state support:

```tsx
function Navigation() {
  return (
    <nav>
      {/* Simple links */}
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>

      {/* Links with parameters */}
      <Link to='/user/:id' params={{ id: '123' }}>
        User Profile
      </Link>

      {/* Links with styling */}
      <Link
        to='/dashboard'
        className='nav-link'
        activeClassName='nav-link-active'
      >
        Dashboard
      </Link>

      {/* Links support all standard anchor props */}
      <Link to='/external' target='_blank'>
        External Link
      </Link>
    </nav>
  );
}
```

### Active View Rendering

The ActiveView component automatically renders the component for the current
route:

```tsx
function App() {
  return (
    <RouterProvider>
      <div className='app'>
        <header>
          <Navigation />
        </header>

        <main>
          {/* This renders the component for the current route */}
          <ActiveView />
        </main>
      </div>
    </RouterProvider>
  );
}
```

## API Reference

### `createRouterForReact(routes, options?)`

Creates a new React router instance with components and hooks.

#### Parameters

- `routes`: An array of route definitions (use `as const` for best type
  inference)
- `options`: Optional configuration object (same as type-router options)

#### Returns

An object containing:

- `RouterProvider`: React context provider component
- `Link`: Type-safe link component
- `ActiveView`: Component that renders the current route's component
- `useNavigate`: Hook that returns the navigation function
- `useParams`: Hook that returns current route parameters

#### Options

Same options as the base type-router library:

| Option          | Type                  | Default     | Description                                  |
| --------------- | --------------------- | ----------- | -------------------------------------------- |
| `urlType`       | `'hash' \| 'history'` | `'history'` | Routing mode to use                          |
| `fallbackPath`  | `string`              | `undefined` | Route to use when no match is found          |
| `autoInit`      | `boolean`             | `true`      | Automatically initialize routing on creation |
| `onEnter`       | `function`            | `undefined` | Global hook called when entering any route   |
| `onExit`        | `function`            | `undefined` | Global hook called when exiting any route    |
| `onParamChange` | `function`            | `undefined` | Global hook called when params change        |
| `onMiss`        | `function`            | `undefined` | Called when no route matches                 |

### `makeComponentRoute(route)`

Helper function that creates a component route with proper TypeScript inference.

```tsx
const userRoute = makeComponentRoute({
  path: '/user/:id',
  component: ({ id }: { id: string }) => <div>User: {id}</div>,
});
```

### React Components

#### `<RouterProvider>`

Context provider that must wrap your app to provide routing context.

```tsx
<RouterProvider>
  <App />
</RouterProvider>;
```

#### `<Link>`

Type-safe navigation component.

```tsx
type LinkProps = {
  to: Path;
  params?: ParamsFor<Path>;
  children?: React.ReactNode;
  className?: string;
  activeClassName?: string;
  // ... all other anchor element props
};
```

#### `<ActiveView>`

Renders the component for the currently active route.

```tsx
<ActiveView />;
```

### React Hooks

#### `useNavigate()`

Returns the navigation function.

```tsx
const navigate = useNavigate();
await navigate('/user/123');
```

#### `useParams()`

Returns the current route parameters.

```tsx
const params = useParams(); // { id: string } for route /user/:id
```

#### `useRoute()`

Returns the current route state.

```tsx
const route = useRoute();
console.log(route.path, route.params, route.route);
```

## Advanced Usage

### Conditional Rendering

```tsx
function ConditionalApp() {
  const route = useRoute();
  const isUserPage = route.route?.path === '/user/:id';

  return (
    <RouterProvider>
      {isUserPage && <UserSidebar />}
      <ActiveView />
    </RouterProvider>
  );
}
```

### Route Guards

```tsx
const protectedRoutes = [
  {
    path: '/dashboard',
    onEnter: () => {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
    },
  },
] as const;
```

### Loading States

```tsx
function App() {
  const [loading, setLoading] = useState(false);

  const router = useMemo(() =>
    createRouterForReact(routes, {
      onEnter: () => setLoading(true),
      onExit: () => setLoading(false),
    }), []);

  return (
    <router.RouterProvider>
      {loading && <LoadingSpinner />}
      <router.ActiveView />
    </router.RouterProvider>
  );
}
```

### Error Boundaries

```tsx
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with routing.</div>;
    }

    return this.props.children;
  }
}

function App() {
  return (
    <RouterProvider>
      <RouteErrorBoundary>
        <ActiveView />
      </RouteErrorBoundary>
    </RouterProvider>
  );
}
```

### Integration with State Management

```tsx
// Redux/Zustand integration
function App() {
  const dispatch = useDispatch();

  const router = useMemo(() =>
    createRouterForReact(routes, {
      onEnter: (route, params) => {
        dispatch(routeChanged({ route: route.path, params }));
      },
    }), [dispatch]);

  return (
    <router.RouterProvider>
      <router.ActiveView />
    </router.RouterProvider>
  );
}
```

## TypeScript Benefits

type-router-react provides exceptional TypeScript support:

### Type-Safe Navigation

```tsx
const { Link, useNavigate } = createRouterForReact([
  makeComponentRoute({ path: "/user/:id", component: UserProfile }),
  makeComponentRoute({ path: "/post/:category/:slug", component: Post }),
] as const, {});

// ✅ All valid
<Link to="/user/:id" params={{ id: "123" }} />
<Link to="/post/:category/:slug" params={{ category: "tech", slug: "intro" }} />

// ❌ TypeScript errors
<Link to="/unknown" />  {/* Unknown route */}
<Link to="/user/:id" params={{ wrong: "123" }} />  {/* Wrong param */}
```

### Inferred Component Props

```tsx
// TypeScript automatically infers the props from the route parameters
const UserProfile = ({ id }: { id: string }) => {
  return <div>User: {id}</div>;
};

makeComponentRoute({
  path: '/user/:id',
  component: UserProfile, // TypeScript ensures props match params!
});
```

### Hook Type Safety

```tsx
function UserComponent() {
  // TypeScript knows the exact type of params based on current route
  const params = useParams(); // Typed based on active route
  const navigate = useNavigate(); // Typed navigation function

  // Type-safe navigation
  await navigate('/user/:id', { id: params.id });
}
```

## Migration from type-router

If you're migrating from the base type-router library:

```tsx
// Before (type-router)
import { createRouter } from '@itaylor/type-router';

const router = createRouter(
  [
    {
      path: '/user/:id',
      onEnter: (params) => {
        // Manual DOM manipulation
        document.getElementById('app').innerHTML =
          `<div>User: ${params.id}</div>`;
      },
    },
  ] as const,
);

// After (type-router-react)
import {
  createRouterForReact,
  makeComponentRoute,
} from '@itaylor/type-router-react';

const UserComponent = ({ id }: { id: string }) => <div>User: {id}</div>;

const { RouterProvider, ActiveView } = createRouterForReact(
  [
    makeComponentRoute({ path: '/user/:id', component: UserComponent }),
  ] as const,
  {},
);

function App() {
  return (
    <RouterProvider>
      <ActiveView />
    </RouterProvider>
  );
}
```

## Examples

Check out the `/examples` directory for complete working examples including:

- Basic routing setup
- Advanced patterns
- Integration with popular libraries
- Server-side rendering considerations

## License

MIT
