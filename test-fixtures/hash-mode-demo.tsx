import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRouterForReact,
  makeComponentRoute,
} from '../type-router-react.tsx';

// Hash Home Component
function HashHomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Update hash indicator in header
    updateHashIndicator();
  }, []);

  return (
    <div className='route-content'>
      <h2>🏠 Hash Mode Home</h2>
      <p>
        Welcome to the hash mode routing demo! This demonstrates how
        type-router-react works with hash-based routing where URLs use the #
        fragment for navigation.
      </p>
      <p>
        Hash mode is perfect for static hosting environments or when you can't
        configure your server to handle client-side routing.
      </p>
      <div>
        <button
          className='action-button'
          onClick={() => navigate('/gallery')}
          data-testid='nav-to-gallery'
        >
          Visit Gallery
        </button>
        <button
          className='action-button secondary'
          onClick={() => navigate('/gallery/:category', { category: 'nature' })}
          data-testid='nav-to-nature'
        >
          Nature Photos
        </button>
      </div>
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#a16207' }}>
        Notice how the URL shows <code>#{window.location.hash}</code>
      </div>
    </div>
  );
}

// Gallery Component
function GalleryPage() {
  const navigate = useNavigate();
  const route = useRoute();

  useEffect(() => {
    updateHashIndicator();
  }, []);

  const categories = [
    { id: 'nature', name: 'Nature', emoji: '🌲' },
    { id: 'urban', name: 'Urban', emoji: '🏙️' },
    { id: 'people', name: 'People', emoji: '👥' },
    { id: 'abstract', name: 'Abstract', emoji: '🎨' },
  ];

  return (
    <div className='route-content'>
      <h2>📸 Photo Gallery</h2>
      <p>
        Browse our photo collection by category. Each category demonstrates
        parameterized routing in hash mode.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          margin: '24px 0',
        }}
      >
        {categories.map((category) => (
          <div
            key={category.id}
            style={{
              border: '2px solid #fed7aa',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() =>
              navigate('/gallery/:category', { category: category.id })}
            data-testid={`category-${category.id}`}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              {category.emoji}
            </div>
            <h4 style={{ margin: '0', color: '#9a3412' }}>
              {category.name}
            </h4>
          </div>
        ))}
      </div>

      <div>
        <button
          className='action-button secondary'
          onClick={() => navigate('/settings')}
          data-testid='nav-to-settings'
        >
          Gallery Settings
        </button>
      </div>
    </div>
  );
}

// Category Gallery Component
function CategoryGalleryPage({ category }: { category: string }) {
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    updateHashIndicator();
  }, [category]);

  // Mock photo data
  const photos = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `${category} Photo ${i + 1}`,
    description: `Beautiful ${category} photography`,
  }));

  const categoryInfo = {
    nature: { name: 'Nature', emoji: '🌲', color: '#059669' },
    urban: { name: 'Urban', emoji: '🏙️', color: '#0284c7' },
    people: { name: 'People', emoji: '👥', color: '#7c3aed' },
    abstract: { name: 'Abstract', emoji: '🎨', color: '#dc2626' },
  }[category] || { name: category, emoji: '📷', color: '#6b7280' };

  return (
    <div className='route-content'>
      <h2>{categoryInfo.emoji} {categoryInfo.name} Gallery</h2>
      <p>
        Viewing photos in the {category}{' '}
        category. This demonstrates how parameters are passed to components in
        hash mode routing.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
          margin: '24px 0',
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            style={{
              aspectRatio: '1',
              background:
                `linear-gradient(135deg, ${categoryInfo.color}20, ${categoryInfo.color}40)`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fed7aa',
              cursor: 'pointer',
            }}
            onClick={() =>
              navigate('/gallery/:category/:id', {
                category,
                id: photo.id.toString(),
              })}
            data-testid={`photo-${photo.id}`}
          >
            <div style={{ textAlign: 'center', color: categoryInfo.color }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                {categoryInfo.emoji}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                #{photo.id}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          className='action-button'
          onClick={() => navigate('/gallery')}
          data-testid='back-to-gallery'
        >
          ← Back to Gallery
        </button>
        <button
          className='action-button secondary'
          onClick={() =>
            navigate('/gallery/:category/:id', {
              category,
              id: '1',
            })}
          data-testid='view-first-photo'
        >
          View Photo #1
        </button>
      </div>

      <div className='route-info'>
        <div>Category Param: {category}</div>
        <div>All Params: {JSON.stringify(params)}</div>
      </div>
    </div>
  );
}

// Photo Detail Component
function PhotoDetailPage({ category, id }: { category: string; id: string }) {
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    updateHashIndicator();
  }, [category, id]);

  const categoryInfo = {
    nature: { name: 'Nature', emoji: '🌲' },
    urban: { name: 'Urban', emoji: '🏙️' },
    people: { name: 'People', emoji: '👥' },
    abstract: { name: 'Abstract', emoji: '🎨' },
  }[category] || { name: category, emoji: '📷' };

  const nextId = (parseInt(id) % 8) + 1;
  const prevId = parseInt(id) === 1 ? 8 : parseInt(id) - 1;

  return (
    <div className='route-content'>
      <h2>📷 Photo Detail</h2>

      <div
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #fed7aa',
          }}
        >
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>
              {categoryInfo.emoji}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Photo #{id}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>{categoryInfo.name} Photo #{id}</h3>
          <p>
            <strong>Category:</strong> {category}
            <br />
            <strong>Photo ID:</strong> {id}
            <br />
            <strong>Title:</strong> Beautiful {category} photography<br />
            <strong>Description:</strong> This is a stunning example of{' '}
            {category}{' '}
            photography that demonstrates the router's ability to handle
            multiple parameters in hash mode.
          </p>

          <div style={{ marginTop: '20px' }}>
            <button
              className='action-button'
              onClick={() =>
                navigate('/gallery/:category/:id', {
                  category,
                  id: prevId.toString(),
                })}
              data-testid='prev-photo'
            >
              ← Previous
            </button>
            <button
              className='action-button'
              onClick={() =>
                navigate('/gallery/:category/:id', {
                  category,
                  id: nextId.toString(),
                })}
              data-testid='next-photo'
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button
          className='action-button secondary'
          onClick={() => navigate('/gallery/:category', { category })}
          data-testid='back-to-category'
        >
          ← Back to {categoryInfo.name}
        </button>
      </div>

      <div className='route-info'>
        <div>Multiple Params: {JSON.stringify(params)}</div>
        <div>Category: {category}, ID: {id}</div>
      </div>
    </div>
  );
}

// Settings Component
function SettingsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    updateHashIndicator();
  }, []);

  const [settings, setSettings] = useState({
    theme: 'light',
    photosPerPage: '8',
    autoPlay: true,
  });

  return (
    <div className='route-content'>
      <h2>⚙️ Gallery Settings</h2>
      <p>
        Configure your gallery preferences. This demonstrates form handling
        within hash mode routing.
      </p>

      <div style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold',
            }}
          >
            Theme:
          </label>
          <select
            value={settings.theme}
            onChange={(e) =>
              setSettings({ ...settings, theme: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '2px solid #fed7aa',
            }}
            data-testid='theme-select'
          >
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
            <option value='auto'>Auto</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontWeight: 'bold',
            }}
          >
            Photos per page:
          </label>
          <input
            type='number'
            value={settings.photosPerPage}
            onChange={(e) =>
              setSettings({ ...settings, photosPerPage: e.target.value })}
            min='4'
            max='20'
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '2px solid #fed7aa',
            }}
            data-testid='photos-per-page'
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <input
              type='checkbox'
              checked={settings.autoPlay}
              onChange={(e) =>
                setSettings({ ...settings, autoPlay: e.target.checked })}
              style={{ marginRight: '8px' }}
              data-testid='autoplay-checkbox'
            />
            <span style={{ fontWeight: 'bold' }}>
              Enable slideshow autoplay
            </span>
          </label>
        </div>

        <button
          className='action-button'
          onClick={() => alert('Settings saved!')}
          data-testid='save-settings'
        >
          Save Settings
        </button>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button
          className='action-button secondary'
          onClick={() => navigate('/gallery')}
          data-testid='back-to-gallery-from-settings'
        >
          ← Back to Gallery
        </button>
      </div>
    </div>
  );
}

// Helper function to update hash indicator
function updateHashIndicator() {
  const indicator = document.querySelector('[data-testid="hash-indicator"]');
  if (indicator) {
    indicator.textContent = `Current hash: ${window.location.hash || '#/'}`;
  }
}

// Define routes for hash mode
const routes = [
  makeComponentRoute({ path: '/', component: HashHomePage }),
  makeComponentRoute({ path: '/gallery', component: GalleryPage }),
  makeComponentRoute({
    path: '/gallery/:category',
    component: CategoryGalleryPage,
  }),
  makeComponentRoute({
    path: '/gallery/:category/:id',
    component: PhotoDetailPage,
  }),
  makeComponentRoute({ path: '/settings', component: SettingsPage }),
] as const;

// Create router with hash mode
const { RouterProvider, Link, ActiveView, useNavigate, useParams, useRoute } =
  createRouterForReact(routes, {
    urlType: 'hash', // This is the key difference!
  });

// Navigation Component
function Navigation() {
  const route = useRoute();
  const params = useParams();

  return (
    <nav data-testid='hash-navigation'>
      <Link
        to='/'
        className='nav-link'
        activeClassName='active'
        data-testid='hash-home-link'
      >
        Home
      </Link>
      <Link
        to='/gallery'
        className='nav-link'
        activeClassName='active'
        data-testid='hash-gallery-link'
        activeComparisonType='ancestor'
      >
        Gallery
      </Link>
      <Link
        to='/settings'
        className='nav-link'
        activeClassName='active'
        data-testid='hash-settings-link'
      >
        Settings
      </Link>

      <div className='route-info'>
        <div>Current: {route.path || 'none'}</div>
        <div>Params: {JSON.stringify(params)}</div>
        <div>Hash: {window.location.hash}</div>
      </div>
    </nav>
  );
}

// Main App Component
function HashApp() {
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
  root.render(<HashApp />);
}
