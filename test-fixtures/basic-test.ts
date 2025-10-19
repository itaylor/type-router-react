import {
  createRouterForReact,
  makeComponentRoute,
} from '../type-router-react.tsx';

// Get React from global (loaded via CDN)
declare global {
  const React: any;
  const ReactDOM: any;
}

const { createElement: h, useState, useEffect } = React;
const { createRoot } = ReactDOM;

// Test logging utility
const testResults: string[] = [];
window.log = (msg: string) => {
  testResults.push(msg);
  const output = document.getElementById('test-output');
  if (output) {
    const line = document.createElement('div');
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }
};

// Test Components
function HomeComponent() {
  useEffect(() => {
    window.log('Home component rendered');
  }, []);

  return h(
    'div',
    { className: 'route-content' },
    h('h2', null, '🏠 Home Page'),
    h('p', null, 'Welcome to the home page!'),
    h('p', null, 'This component was rendered by ActiveView.'),
  );
}

function AboutComponent() {
  useEffect(() => {
    window.log('About component rendered');
  }, []);

  return h(
    'div',
    { className: 'route-content' },
    h('h2', null, 'ℹ️ About Page'),
    h('p', null, 'Learn more about type-router-react.'),
    h(
      'ul',
      null,
      h('li', null, '✅ Type-safe routing'),
      h('li', null, '✅ React hooks integration'),
      h('li', null, '✅ Component-based routes'),
      h('li', null, '✅ Active link states'),
    ),
  );
}

function UserComponent({ id }: { id: string }) {
  useEffect(() => {
    window.log(`User component rendered with ID: ${id}`);
  }, [id]);

  return h(
    'div',
    { className: 'route-content' },
    h('h2', null, `👤 User Profile: ${id}`),
    h('p', null, `User ID from props: ${id}`),
    h(
      'div',
      { style: { marginTop: '10px' } },
      h('button', {
        type: 'button',
        onClick: () => navigate('/user/:id', { id: '456' }),
      }, 'Switch to User 456'),
      h('button', {
        type: 'button',
        onClick: () =>
          navigate('/post/:category/:slug', {
            category: 'tech',
            slug: 'react-tips',
          }),
      }, 'View Tech Post'),
    ),
  );
}

function PostComponent({ category, slug }: { category: string; slug: string }) {
  useEffect(() => {
    window.log(`Post component rendered: ${category}/${slug}`);
  }, [category, slug]);

  return h(
    'div',
    { className: 'route-content' },
    h('h2', null, `📝 Blog Post`),
    h('p', null, `Category: ${category}`),
    h('p', null, `Slug: ${slug}`),
    h(
      'div',
      { style: { padding: '15px', background: '#f8f9fa', marginTop: '10px' } },
      h(
        'h3',
        null,
        slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      ),
      h('p', null, `This is a sample blog post in the ${category} category.`),
    ),
  );
}

// Define routes using the library directly
const routes = [
  makeComponentRoute({ path: '/', component: HomeComponent }),
  makeComponentRoute({ path: '/about', component: AboutComponent }),
  makeComponentRoute({ path: '/user/:id', component: UserComponent }),
  makeComponentRoute({
    path: '/post/:category/:slug',
    component: PostComponent,
  }),
] as const;

// Create router using the library directly
const router = createRouterForReact(routes, {
  urlType: 'history',
  onEnter: (route, params) => {
    window.log(
      `Router: entering ${route.path} with params ${
        JSON.stringify(params || {})
      }`,
    );
  },
  onExit: (route, params) => {
    window.log(
      `Router: exiting ${route.path} with params ${
        JSON.stringify(params || {})
      }`,
    );
  },
});

const { RouterProvider, Link, ActiveView, useNavigate, useParams, useRoute } =
  router;

// Navigation function for tests
let navigate: ReturnType<typeof useNavigate>;

// Navigation Component
function Navigation() {
  navigate = useNavigate();
  const route = useRoute();
  const params = useParams();

  return h(
    'nav',
    { style: { marginBottom: '20px' } },
    h(Link, {
      to: '/',
      className: 'nav-link',
      activeClassName: 'active',
    }, 'Home'),
    h(Link, {
      to: '/about',
      className: 'nav-link',
      activeClassName: 'active',
    }, 'About'),
    h(Link, {
      to: '/user/:id',
      params: { id: '123' },
      className: 'nav-link',
      activeClassName: 'active',
    }, 'User 123'),
    h(Link, {
      to: '/post/:category/:slug',
      params: { category: 'tech', slug: 'typescript-guide' },
      className: 'nav-link',
      activeClassName: 'active',
    }, 'Tech Post'),
    h(
      'div',
      { style: { marginTop: '10px', fontSize: '12px', color: '#666' } },
      `Current: ${route.path || 'none'} | Params: ${JSON.stringify(params)}`,
    ),
  );
}

// Main App Component
function App() {
  return h(RouterProvider, null, h('div', null, h(Navigation), h(ActiveView)));
}

// Render the app
const root = createRoot(document.getElementById('app'));
root.render(h(App));

// Test Functions - exposed globally for HTML buttons
window.testNavigation = async function () {
  window.log('=== Testing Navigation ===');
  try {
    await navigate('/');
    await new Promise((resolve) => setTimeout(resolve, 100));

    await navigate('/about');
    await new Promise((resolve) => setTimeout(resolve, 100));

    await navigate('/user/:id', { id: '999' });
    await new Promise((resolve) => setTimeout(resolve, 100));

    await navigate('/post/:category/:slug', {
      category: 'demo',
      slug: 'test-post',
    });
    await new Promise((resolve) => setTimeout(resolve, 100));

    window.log('✅ Navigation test completed successfully');
  } catch (error) {
    window.log(`❌ Navigation test failed: ${error.message}`);
  }
};

window.testHooks = function () {
  window.log('=== Testing Hooks ===');
  try {
    // Note: These hooks can only be called within React components
    // This test verifies the hooks exist and the navigation state is accessible
    window.log(`Navigation function type: ${typeof navigate}`);
    window.log(`Test completed - hooks are available within components`);
    window.log('✅ Hooks test completed successfully');
  } catch (error) {
    window.log(`❌ Hooks test failed: ${error.message}`);
  }
};

window.testLinks = function () {
  window.log('=== Testing Links ===');
  try {
    const links = document.querySelectorAll('.nav-link');
    window.log(`Found ${links.length} navigation links`);

    links.forEach((link, index) => {
      window.log(
        `Link ${index + 1}: ${link.textContent} -> ${
          link.getAttribute('href')
        }`,
      );
    });

    if (links.length > 1) {
      window.log('Simulating click on second link...');
      (links[1] as HTMLAnchorElement).click();
    }

    window.log('✅ Links test completed successfully');
  } catch (error) {
    window.log(`❌ Links test failed: ${error.message}`);
  }
};

window.clearOutput = function () {
  const output = document.getElementById('test-output');
  if (output) {
    output.innerHTML = '<div><strong>Test Output:</strong></div>';
  }
  testResults.length = 0;
};

// Initial log
window.log('React Router initialized in history mode');

// Extend window interface for test functions
declare global {
  interface Window {
    log: (msg: string) => void;
    testNavigation: () => Promise<void>;
    testHooks: () => void;
    testLinks: () => void;
    clearOutput: () => void;
  }
}
