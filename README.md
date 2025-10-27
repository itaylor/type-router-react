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

### Recommended Usage pattern

Make a `routes.ts` file that imports `@itaylor/type-router-react` declares the
routes, calls `createRouterForReact` and exports `Link`, `ActiveView`,
`RouterProvider`, and any of the other functions you need.

Now when you use them, import them from the `routes.ts` file, they will always
have the correct types for the routes, without you ever having to manually
declare the types again.

_routes.ts_:

```tsx
import {
  createRouterForReact,
  makeComponentRoute,
} from '@itaylor/type-router-react';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';

const routes = [
  makeComponentRoute({ path: '/', component: Home }),
  makeComponentRoute({ path: '/about?search', component: About }),
  makeComponentRoute({ path: '/contact', component: Contact }),
] as const;

const router = createRouterForReact(routes, { fallbackPath: '/' });

export const {
  Link,
  ActiveView,
  RouterProvider,
  useNavigate,
  useRoute,
} = router;
```

_App.tsx_

```tsx
import { Link, ActiveView } from './routes';

export default function App() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>
      <main>
        <ActiveView />
      </main>
    </div>
  );
```

### Query Parameters

type-router-react inherits powerful query parameter support from the base
type-router library. Query parameters are declared directly in route paths and
provide type-safe, optional parameters that don't affect route matching.

#### Declaring Query Parameters

Query parameters are declared using the syntax `?param1&param2&param3` after the
path:

```tsx
import {
  createRouterForReact,
  makeComponentRoute,
} from '@itaylor/type-router-react';

// Component that handles search with optional query parameters
function SearchPage({ q, category, sort }: {
  q?: string;
  category?: string;
  sort?: string;
}) {
  return (
    <div>
      <h1>Search Results</h1>
      <p>Query: {q || 'No query'}</p>
      <p>Category: {category || 'All'}</p>
      <p>Sort: {sort || 'Default'}</p>
    </div>
  );
}

// Component for product pages with mixed path and query parameters
function ProductPage({ id, color, size, variant }: {
  id: string; // Required path parameter
  color?: string; // Optional query parameter
  size?: string; // Optional query parameter
  variant?: string; // Optional query parameter
}) {
  return (
    <div>
      <h1>Product: {id}</h1>
      <p>Color: {color || 'Default'}</p>
      <p>Size: {size || 'Standard'}</p>
      <p>Variant: {variant || 'Basic'}</p>
    </div>
  );
}

const { RouterProvider, Link, ActiveView, useNavigate } = createRouterForReact(
  [
    makeComponentRoute({ path: '/', component: Home }),
    makeComponentRoute({
      path: '/search?q&category&sort',
      component: SearchPage,
    }),
    makeComponentRoute({
      path: '/product/:id?color&size&variant',
      component: ProductPage,
    }),
  ] as const,
  {},
);
```

#### Navigation with Query Parameters

The enhanced path-only navigation supports three equivalent patterns:

```tsx
function NavigationExample() {
  const navigate = useNavigate();

  const handleSearch = async () => {
    // 1. Path template (enhanced) - most readable
    await navigate('/search?q&category&sort', {
      q: 'typescript',
      category: 'programming',
      sort: 'newest',
    });

    // 2. Concrete path (enhanced) - works with any matching route
    await navigate('/search', {
      q: 'react',
      category: 'frontend',
    });

    // 3. Traditional (still works)
    await navigate('/search?q&category&sort', {
      q: 'vue',
      category: 'frontend',
      sort: 'popular',
    });
  };

  const handleProduct = async () => {
    // Mixed path and query parameters
    await navigate('/product/:id', {
      id: 'laptop123', // Required path parameter
      color: 'silver', // Optional query parameter
      size: '15inch', // Optional query parameter
      variant: 'premium', // Optional query parameter
    });
  };

  return (
    <div>
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleProduct}>View Product</button>
    </div>
  );
}
```

#### Links with Query Parameters

The Link component fully supports query parameters with type safety:

```tsx
function NavigationLinks() {
  return (
    <nav>
      {/* Links with query parameters */}
      <Link
        to='/search?q&category&sort'
        params={{ q: 'react', category: 'tutorials' }}
      >
        React Tutorials
      </Link>

      {/* Mixed path and query parameters */}
      <Link
        to='/product/:id?color&size'
        params={{
          id: 'phone456',
          color: 'blue',
          size: '6.1inch',
        }}
      >
        Blue Phone
      </Link>

      {/* Links work without query parameters too */}
      <Link to='/search'>Search (no filters)</Link>
    </nav>
  );
}
```

#### Using Query Parameters in Components

Access query parameters through the component props or hooks:

```tsx
function ProductDetails() {
  const params = useParams(); // Gets all parameters (path + query)

  // TypeScript knows the exact types based on the current route
  return (
    <div>
      <h1>Product: {params.id}</h1>
      {params.color && <p>Color: {params.color}</p>}
      {params.size && <p>Size: {params.size}</p>}
      {params.variant && <p>Variant: {params.variant}</p>}
    </div>
  );
}

// Alternative: Direct prop injection for component routes
function SearchResults({ q, category, sort }: {
  q?: string;
  category?: string;
  sort?: string;
}) {
  // Props are automatically injected from route parameters
  const hasFilters = category || sort;

  return (
    <div>
      <h1>Search: {q || 'All'}</h1>
      {hasFilters && (
        <div className='filters'>
          {category && <span>Category: {category}</span>}
          {sort && <span>Sort: {sort}</span>}
        </div>
      )}
    </div>
  );
}
```

#### Key Features

- **Path parameters are required** (`string`) - extracted from URL path segments
- **Query parameters are optional** (`string | undefined`) - declared after `?`
- **Path parameters trump query parameters** with the same name
- **URL encoding/decoding** is handled automatically
- **Only declared parameters** are extracted; undeclared params are ignored
- **Query parameters don't affect route matching** - only the path part matters
- **Full TypeScript support** - parameter types are automatically inferred

```tsx
// Example showing parameter precedence
const router = createRouterForReact(
  [
    makeComponentRoute({
      path: '/user/:id?id&settings',
      component: UserPage,
    }),
  ] as const,
  {},
);

// When navigating to: /user/alice?id=ignored&settings=dark
// params.id === 'alice' (from path), not 'ignored' (from query)
// params.settings === 'dark' (from query)
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

## Examples

Check out the `/examples` and `test-fixtures` directories for complete working examples including:

- Basic routing setup
- Advanced patterns

## License

MIT
