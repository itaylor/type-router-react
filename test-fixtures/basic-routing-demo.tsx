import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRouterForReact,
  makeComponentRoute,
} from '../type-router-react.tsx';

// Home Page Component
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className='route-content'>
      <h2>🏠 Welcome Home</h2>
      <p>
        This is the home page of our basic routing demo. It showcases the core
        features of type-router-react including navigation, component rendering,
        and active link states.
      </p>
      <p>
        Use the navigation links above to explore different pages, or click the
        buttons below to test programmatic navigation.
      </p>
      <div>
        <button
          type='button'
          className='action-button'
          onClick={() => navigate('/about')}
          data-testid='nav-to-about'
        >
          Go to About
        </button>
        <button
          type='button'
          className='action-button secondary'
          onClick={() => navigate('/user/:id', { id: 'demo-user' })}
          data-testid='nav-to-user'
        >
          View Demo User
        </button>
      </div>
    </div>
  );
}

// About Page Component
function AboutPage() {
  const route = useRoute();
  const params = useParams();

  return (
    <div className='route-content'>
      <h2>ℹ️ About This Demo</h2>
      <p>
        This demo showcases type-router-react, a lightweight, type-safe router
        for React applications.
      </p>
      <ul>
        <li>✅ Type-safe routing with TypeScript</li>
        <li>✅ React hooks integration (useNavigate, useRoute, useParams)</li>
        <li>✅ Component-based routes with ActiveView</li>
        <li>✅ Active link states and smooth navigation</li>
        <li>✅ Support for parameterized routes</li>
      </ul>
      <p>
        This page demonstrates basic component rendering and the use of React
        hooks provided by the router.
      </p>
      <div className='route-info'>
        <div>Current Route: {route.path || 'none'}</div>
        <div>Route Params: {JSON.stringify(params)}</div>
      </div>
    </div>
  );
}

// User Profile Component with Parameters
function UserProfilePage({ id }: { id: string }) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    // Simulate loading user data
    const userData = {
      id,
      name: id === 'demo-user' ? 'Demo User' : `User ${id}`,
      email: `${id}@example.com`,
      joinDate: '2024-01-15',
      posts: Math.floor(Math.random() * 50) + 1,
    };
    setUserInfo(userData);
  }, [id]);

  const switchUser = (newId: string) => {
    navigate('/user/:id', { id: newId });
  };

  if (!userInfo) {
    return (
      <div className='route-content'>
        <div>Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className='route-content'>
      <h2>👤 User Profile</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>{userInfo.name}</h3>
        <p>
          <strong>User ID:</strong> {userInfo.id}
        </p>
        <p>
          <strong>Email:</strong> {userInfo.email}
        </p>
        <p>
          <strong>Member since:</strong> {userInfo.joinDate}
        </p>
        <p>
          <strong>Posts:</strong> {userInfo.posts}
        </p>
      </div>

      <div>
        <h4>Switch to another user:</h4>
        <button
          type='button'
          className='action-button'
          onClick={() => switchUser('alice')}
          data-testid='switch-to-alice'
        >
          View Alice
        </button>
        <button
          type='button'
          className='action-button'
          onClick={() => switchUser('bob')}
          data-testid='switch-to-bob'
        >
          View Bob
        </button>
        <button
          type='button'
          className='action-button secondary'
          onClick={() => navigate('/contact')}
          data-testid='nav-to-contact'
        >
          Go to Contact
        </button>
      </div>

      <div className='route-info'>
        <div>Route Params: {JSON.stringify(params)}</div>
        <div>Component Prop ID: {id}</div>
      </div>
    </div>
  );
}

// Contact Page Component
function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className='route-content'>
      <h2>📧 Contact Us</h2>
      <p>
        This page demonstrates basic component rendering within a routed
        component. It showcases how different pages can be rendered through the
        router with clean navigation between routes.
      </p>
      <p>
        No complex state management needed here - just simple routing
        functionality that allows users to navigate to this page and then return
        to other parts of the application.
      </p>

      <div style={{ marginTop: '24px' }}>
        <button
          type='button'
          className='action-button'
          onClick={() => navigate('/')}
          data-testid='nav-to-home'
        >
          Back to Home
        </button>
        <button
          type='button'
          className='action-button secondary'
          onClick={() => navigate('/about')}
          data-testid='nav-to-about'
        >
          Go to About
        </button>
      </div>
    </div>
  );
}

// 404 Not Found Component
function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className='route-content' style={{ textAlign: 'center' }}>
      <h2>❌ 404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <p>This demonstrates the fallback route functionality.</p>
      <div>
        <button
          type='button'
          className='action-button'
          onClick={() => navigate('/')}
          data-testid='nav-home-from-404'
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

// Define routes
const routes = [
  makeComponentRoute({ path: '/', component: HomePage }),
  makeComponentRoute({ path: '/about', component: AboutPage }),
  makeComponentRoute({ path: '/user/:id', component: UserProfilePage }),
  makeComponentRoute({ path: '/contact', component: ContactPage }),
  makeComponentRoute({ path: '/404', component: NotFoundPage }),
] as const;

// Create router with explicit history mode (not the new default hash mode)
const { RouterProvider, Link, ActiveView, useNavigate, useParams, useRoute } =
  createRouterForReact(routes, {
    urlType: 'history', // Explicitly use history mode for this demo
    fallbackPath: '/404',
  });

// Navigation Component
function Navigation() {
  return (
    <nav data-testid='main-navigation'>
      <Link
        to='/'
        className='nav-link'
        activeClassName='active'
        data-testid='home-link'
      >
        Home
      </Link>
      <Link
        to='/about'
        className='nav-link'
        activeClassName='active'
        data-testid='about-link'
      >
        About
      </Link>
      <Link
        to='/user/:id'
        params={{ id: 'demo-user' }}
        className='nav-link'
        activeClassName='active'
        data-testid='user-link'
      >
        User Profile
      </Link>
      <Link
        to='/contact'
        className='nav-link'
        activeClassName='active'
        data-testid='contact-link'
      >
        Contact
      </Link>

      <RouteInfo />
    </nav>
  );
}

function RouteInfo() {
  const route = useRoute();
  const params = useParams();

  return (
    <div className='route-info'>
      <div>Current: {route.path || 'none'}</div>
      <div>Params: {JSON.stringify(params)}</div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <RouterProvider>
      <Navigation />
      <ActiveView />
    </RouterProvider>
  );
}

// Initialize the app
const appElement = document.getElementById('app');
if (appElement) {
  const root = createRoot(appElement);
  root.render(<App />);
}
