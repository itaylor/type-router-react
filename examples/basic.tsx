import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRouterForReact,
  makeComponentRoute,
} from '../type-router-react.tsx';

// ============================================================================
// React Components for Routes
// ============================================================================

function HomeComponent() {
  const navigate = useNavigate();
  const route = useRoute();

  return (
    <div
      style={{ padding: '20px', border: '2px solid #007bff', margin: '10px 0' }}
    >
      <h2>🏠 Home Page</h2>
      <p>Welcome to the type-router-react demo!</p>
      <p>
        <strong>Current path:</strong> {route.path}
      </p>

      <div style={{ marginTop: '15px' }}>
        <button
          type='button'
          onClick={() => navigate('/about')}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Go to About (Hook Navigation)
        </button>
        <button
          type='button'
          onClick={() => navigate('/user/:id', { id: '123' })}
          style={{ padding: '8px 16px' }}
        >
          Go to User 123 (Parameterized)
        </button>
      </div>
    </div>
  );
}

function AboutComponent() {
  const params = useParams();

  return (
    <div
      style={{ padding: '20px', border: '2px solid #28a745', margin: '10px 0' }}
    >
      <h2>ℹ️ About Page</h2>
      <p>This is the about page demonstrating type-safe routing with React!</p>
      <p>
        <strong>Current params:</strong> {JSON.stringify(params)}
      </p>

      <h3>Features:</h3>
      <ul>
        <li>✅ 100% Type-Safe Navigation</li>
        <li>✅ React Hooks Integration</li>
        <li>✅ Component-based Routes</li>
        <li>✅ Active Link States</li>
        <li>✅ Parameter Extraction</li>
      </ul>
    </div>
  );
}

function UserProfileComponent({ id }: { id: string }) {
  const route = useRoute();
  const navigate = useNavigate();

  return (
    <div
      style={{ padding: '20px', border: '2px solid #dc3545', margin: '10px 0' }}
    >
      <h2>👤 User Profile</h2>
      <p>
        <strong>User ID:</strong> {id}
      </p>
      <p>
        <strong>Route path:</strong> {route.path}
      </p>

      <div style={{ marginTop: '15px' }}>
        <button
          type='button'
          onClick={() => navigate('/user/:id', { id: '456' })}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Switch to User 456
        </button>
        <button
          type='button'
          onClick={() =>
            navigate('/post/:category/:slug', {
              category: 'tech',
              slug: 'react-routing',
            })}
          style={{ padding: '8px 16px' }}
        >
          View Tech Post
        </button>
      </div>
    </div>
  );
}

function BlogPostComponent(
  { category, slug }: { category: string; slug: string },
) {
  const params = useParams();

  return (
    <div
      style={{ padding: '20px', border: '2px solid #6f42c1', margin: '10px 0' }}
    >
      <h2>📝 Blog Post</h2>
      <p>
        <strong>Category:</strong> {category}
      </p>
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <p>
        <strong>All params:</strong> {JSON.stringify(params)}
      </p>

      <div
        style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa' }}
      >
        <h3>
          Sample Article:{' '}
          {slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </h3>
        <p>
          This is a sample blog post in the <em>{category}</em> category.
        </p>
        <p>
          The content would be loaded based on the slug: <code>{slug}</code>
        </p>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  const route = useRoute();

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #ffc107',
        margin: '10px 0',
        textAlign: 'center',
      }}
    >
      <h2>🚫 404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <p>
        <strong>Attempted path:</strong> {route.path}
      </p>
    </div>
  );
}

// ============================================================================
// Route Definitions
// ============================================================================

const routes = [
  makeComponentRoute({ path: '/', component: HomeComponent }),
  makeComponentRoute({ path: '/about', component: AboutComponent }),
  makeComponentRoute({ path: '/user/:id', component: UserProfileComponent }),
  makeComponentRoute({
    path: '/post/:category/:slug',
    component: BlogPostComponent,
  }),
  makeComponentRoute({ path: '/404', component: NotFoundComponent }),
] as const;

// Create the router
const { RouterProvider, Link, ActiveView, useNavigate, useParams, useRoute } =
  createRouterForReact(routes, {
    urlType: 'history', // Use history mode for clean URLs
    fallbackPath: '/404', // Redirect to 404 for unknown routes
  });

// ============================================================================
// Navigation Component
// ============================================================================

function NavigationBar() {
  const route = useRoute();

  return (
    <nav
      style={{
        padding: '15px',
        background: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px',
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <Link
          to='/'
          className='nav-link'
          activeClassName='nav-link-active'
          style={{
            marginRight: '15px',
            padding: '8px 16px',
            textDecoration: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: route.path === '/' ? '#007bff' : 'white',
            color: route.path === '/' ? 'white' : '#333',
          }}
        >
          🏠 Home
        </Link>

        <Link
          to='/about'
          style={{
            marginRight: '15px',
            padding: '8px 16px',
            textDecoration: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: route.path === '/about' ? '#28a745' : 'white',
            color: route.path === '/about' ? 'white' : '#333',
          }}
        >
          ℹ️ About
        </Link>

        <Link
          to='/user/:id'
          params={{ id: '123' }}
          style={{
            marginRight: '15px',
            padding: '8px 16px',
            textDecoration: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: route.path?.startsWith('/user/') ? '#dc3545' : 'white',
            color: route.path?.startsWith('/user/') ? 'white' : '#333',
          }}
        >
          👤 User Profile
        </Link>

        <Link
          to='/post/:category/:slug'
          params={{ category: 'tech', slug: 'typescript-tips' }}
          style={{
            padding: '8px 16px',
            textDecoration: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: route.path?.startsWith('/post/') ? '#6f42c1' : 'white',
            color: route.path?.startsWith('/post/') ? 'white' : '#333',
          }}
        >
          📝 Blog Post
        </Link>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <strong>Current Route:</strong> {route.path} |
        <strong>Params:</strong> {JSON.stringify(route.params)}
      </div>
    </nav>
  );
}

// ============================================================================
// Demo Controls Component
// ============================================================================

function DemoControls() {
  const navigate = useNavigate();
  const [customUserId, setCustomUserId] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customSlug, setCustomSlug] = useState('');

  return (
    <div
      style={{
        padding: '20px',
        background: '#e9ecef',
        marginTop: '20px',
        borderRadius: '8px',
      }}
    >
      <h3>🎮 Demo Controls</h3>
      <p>Test programmatic navigation with custom parameters:</p>

      <div style={{ marginBottom: '15px' }}>
        <label>
          User ID:
          <input
            type='text'
            value={customUserId}
            onChange={(e) => setCustomUserId(e.target.value)}
            placeholder='Enter user ID'
            style={{ marginLeft: '10px', padding: '4px 8px' }}
          />
        </label>
        <button
          type='button'
          onClick={() =>
            customUserId && navigate('/user/:id', { id: customUserId })}
          disabled={!customUserId}
          style={{ marginLeft: '10px', padding: '4px 12px' }}
        >
          Go to User
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          Category:
          <input
            type='text'
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder='e.g., tech'
            style={{ marginLeft: '10px', padding: '4px 8px' }}
          />
        </label>
        <label style={{ marginLeft: '15px' }}>
          Slug:
          <input
            type='text'
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            placeholder='e.g., my-post'
            style={{ marginLeft: '10px', padding: '4px 8px' }}
          />
        </label>
        <button
          type='button'
          onClick={() =>
            customCategory && customSlug && navigate('/post/:category/:slug', {
              category: customCategory,
              slug: customSlug,
            })}
          disabled={!customCategory || !customSlug}
          style={{ marginLeft: '10px', padding: '4px 12px' }}
        >
          Go to Post
        </button>
      </div>

      <div>
        <button
          type='button'
          // @ts-expect-error This is to test the handling of something that would happen if type checking was skipped.
          onClick={() => navigate('/nonexistent')}
          style={{
            padding: '4px 12px',
            background: '#ffc107',
            border: '1px solid #ccc',
          }}
        >
          Test 404 (Navigate to non-existent route)
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  return (
    <RouterProvider>
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <header style={{ textAlign: 'center', padding: '20px 0' }}>
          <h1>🚀 type-router-react Demo</h1>
          <p>
            A lightweight, type-safe React router with first-class TypeScript
            support
          </p>
        </header>

        <NavigationBar />

        <main style={{ minHeight: '300px' }}>
          <ActiveView />
        </main>

        <DemoControls />

        <footer
          style={{
            textAlign: 'center',
            padding: '20px 0',
            marginTop: '40px',
            borderTop: '1px solid #ddd',
            fontSize: '14px',
            color: '#666',
          }}
        >
          <p>
            Open your browser's developer tools and check the console for
            navigation events!
          </p>
          <p>
            Try the back/forward buttons to see how the router handles browser
            navigation.
          </p>
        </footer>
      </div>
    </RouterProvider>
  );
}

// ============================================================================
// Initialize the App
// ============================================================================

function initializeApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    // Create root element if it doesn't exist
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    const root = createRoot(newRoot);
    root.render(<App />);
  } else {
    const root = createRoot(rootElement);
    root.render(<App />);
  }
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
}

// Export for use in other examples or tests
export {
  AboutComponent,
  App,
  BlogPostComponent,
  HomeComponent,
  NotFoundComponent,
  routes,
  UserProfileComponent,
};

// For Deno testing
export default App;
