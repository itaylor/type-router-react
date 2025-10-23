/// <reference lib="deno.ns" />
import { launch } from '@astral/astral';
import type { ElementHandle, Page } from '@astral/astral';
import { assertEquals, assertStringIncludes } from '@std/assert';
import {
  BASIC_ROUTING_IP,
  DEFAULT_PORT,
  HASH_MODE_IP,
} from './test-fixtures/server-config.ts';

// Helper function to setup error reporting for a page using evaluate
function setupErrorReporting(page: Page) {
  page.addEventListener('pageerror', (event) => {
    console.error('Page error:', event.detail);
    Deno.exit(1000);
  });
  page.addEventListener('console', (event) => {
    console.log('Console event:', event.detail);
  });
}

// Helper function to wait for element with timeout
async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000,
): Promise<ElementHandle> {
  try {
    return await page.waitForSelector(selector, { timeout });
  } catch (error) {
    // Get page content for debugging
    try {
      const content = await page.content();
      console.error(
        `Page HTML when element '${selector}' not found:`,
        content.substring(0, 1000),
      );
    } catch (e) {
      console.error(`Could not get page content: ${e}`);
    }

    throw new Error(
      `Element '${selector}' not found within ${timeout}ms: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Helper function to wait for text content in element
async function waitForText(
  page: Page,
  selector: string,
  expectedText: string,
  timeout = 5000,
): Promise<void> {
  let lastText = '';
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const element = await page.$(selector);
      if (element) {
        lastText = await element.innerText();
        if (lastText && lastText.includes(expectedText)) {
          return;
        }
      }
    } catch {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  // Take a screenshot of the page and save that to disk
  const screenshot = await page.screenshot();
  Deno.writeFileSync('error.png', screenshot);
  throw new Error(
    `Text '${expectedText}' not found in '${selector}' within ${timeout}ms.  Actual text was: ${lastText}`,
  );
}

Deno.test('Basic Routing - Home page loads and navigation works', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${BASIC_ROUTING_IP}:${DEFAULT_PORT}`,
    );
    // Setup error reporting
    await setupErrorReporting(page);

    // Debug: Check if script loaded and React is available
    const debugInfo = await page.evaluate(() => {
      return {
        hasAppElement: !!document.getElementById('app'),
        hasReact: typeof (window as any).React !== 'undefined',
        hasReactDOM: typeof (window as any).ReactDOM !== 'undefined',
        scriptTags: Array.from(document.querySelectorAll('script')).map((s) =>
          s.src
        ),
        appElementContent: document.getElementById('app')?.innerHTML ||
          'No app element',
        windowErrors: (window as any)._testErrors || [],
      };
    });
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));

    // Wait for React app to load
    await waitForElement(page, '[data-testid="main-navigation"]');

    // Should start on home page
    await waitForElement(page, '.route-content');
    await waitForText(page, '.route-content', 'Welcome Home');

    // Home link should be active
    const homeLink = await page.$('[data-testid="home-link"]');
    const homeClass = await homeLink?.getAttribute('class');
    assertStringIncludes(
      homeClass || '',
      'active',
      'Home link should be active on load',
    );

    // URL should be root
    const url = page.url;
    assertEquals(url.endsWith('/'), true, 'Should be on root URL');
  } finally {
    await browser.close();
  }
});

Deno.test('Basic Routing - Link navigation and active states', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${BASIC_ROUTING_IP}:${DEFAULT_PORT}`,
    );

    // Setup error reporting
    await setupErrorReporting(page);

    await waitForElement(page, '[data-testid="main-navigation"]');

    // Click About link
    let aboutLink = await waitForElement(page, '[data-testid="about-link"]');
    await aboutLink.click();

    // Should navigate to about page
    await waitForText(page, '.route-content', 'About This Demo');
    aboutLink = await waitForElement(page, '[data-testid="about-link"]');

    const aboutClass = await aboutLink.getAttribute('class');
    assertStringIncludes(
      aboutClass || '',
      'active',
      'About link should be active after click',
    );

    // Home link should no longer be active
    const homeLink = await page.$('[data-testid="home-link"]');
    const homeClass = await homeLink?.getAttribute('class');
    assertEquals(
      homeClass?.includes('active') || false,
      false,
      'Home link should not be active after navigating away',
    );

    // Click User Profile link (parameterized route)
    const userLink = await page.$('[data-testid="user-link"]');
    await userLink?.click();

    // Should navigate to user profile with demo-user
    await waitForText(page, '.route-content', 'User Profile');
    await waitForText(page, '.route-content', 'demo-user');
  } finally {
    await browser.close();
  }
});

Deno.test('Basic Routing - Programmatic navigation with useNavigate', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${BASIC_ROUTING_IP}:${DEFAULT_PORT}`,
    );

    // Setup error reporting
    await setupErrorReporting(page);

    await waitForElement(page, '[data-testid="main-navigation"]');

    // Click programmatic navigation button on home page
    const navToAboutBtn = await page.$('[data-testid="nav-to-about"]');
    await navToAboutBtn?.click();

    // Should navigate to about page
    await waitForText(page, '.route-content', 'About This Demo');

    // Go to user page
    const homeLink = await page.$('[data-testid="home-link"]');
    await homeLink?.click();
    await waitForText(page, '.route-content', 'Welcome Home');

    // Click navigate to user button
    const navToUserBtn = await page.$('[data-testid="nav-to-user"]');
    await navToUserBtn?.click();

    // Should navigate to user page with demo-user
    await waitForText(page, '.route-content', 'User Profile');
    await waitForText(page, '.route-content', 'demo-user');
  } finally {
    await browser.close();
  }
});

Deno.test('Basic Routing - Parameterized routes and route switching', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${BASIC_ROUTING_IP}:${DEFAULT_PORT}`,
    );

    // Setup error reporting
    await setupErrorReporting(page);

    await waitForElement(page, '[data-testid="main-navigation"]');

    // Navigate to user profile
    const userLink = await page.$('[data-testid="user-link"]');
    await userLink?.click();
    await waitForText(page, '.route-content', 'demo-user');

    // Switch to Alice
    const switchToAliceBtn = await page.$('[data-testid="switch-to-alice"]');
    await switchToAliceBtn?.click();
    await waitForText(page, '.route-content', 'alice');

    // Switch to Bob
    const switchToBobBtn = await page.$('[data-testid="switch-to-bob"]');
    await switchToBobBtn?.click();
    await waitForText(page, '.route-content', 'bob');

    // Verify route info shows correct params
    await waitForText(page, '.route-content', 'Component Prop ID: bob');
  } finally {
    await browser.close();
  }
});

Deno.test('Basic Routing - Contact page navigation', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${BASIC_ROUTING_IP}:${DEFAULT_PORT}`,
    );

    // Setup error reporting
    await setupErrorReporting(page);

    await waitForElement(page, '[data-testid="main-navigation"]');

    // Navigate to contact page
    let contactLink = await page.$('[data-testid="contact-link"]');
    await contactLink?.click();
    await waitForText(page, '.route-content', 'Contact Us');

    // Verify contact page content
    await waitForText(page, '.route-content', 'basic component rendering');

    // Navigate back to home using button
    const navHomeBtn = await page.$('[data-testid="nav-to-home"]');
    await navHomeBtn?.click();
    await waitForText(page, '.route-content', 'Welcome Home');

    // Navigate back to contact page and then to about
    contactLink = await page.$('[data-testid="contact-link"]');
    await contactLink?.click();
    await waitForText(page, '.route-content', 'Contact Us');

    const navAboutBtn = await page.$('[data-testid="nav-to-about"]');
    await navAboutBtn?.click();
    await waitForText(page, '.route-content', 'About This Demo');
  } finally {
    await browser.close();
  }
});

Deno.test('Hash Mode - Hash URLs and navigation', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${HASH_MODE_IP}:${DEFAULT_PORT}`,
    );

    await waitForElement(page, '[data-testid="hash-navigation"]');

    // Should start on hash home page
    await waitForText(page, '.route-content', 'Hash Mode Home');

    // URL should not have hash initially (or #/ for home)
    let url = page.url;
    assertStringIncludes(url, HASH_MODE_IP, 'Should be on hash mode IP');

    // Click gallery link
    const galleryLink = await page.$('[data-testid="hash-gallery-link"]');
    await galleryLink?.click();
    await waitForText(page, '.route-content', 'Photo Gallery');

    // URL should now contain hash - wait a bit longer for hash to update
    await new Promise((resolve) => setTimeout(resolve, 500));
    url = page.url;
    const currentHash = await page.evaluate(() => window.location.hash);

    // The hash should be present in window.location.hash even if not in page.url
    const fullUrl = currentHash ? `${url}${currentHash}` : url;
    assertStringIncludes(fullUrl, '#', 'URL should contain hash fragment');
    assertStringIncludes(
      fullUrl,
      'gallery',
      'Hash should contain gallery route',
    );

    // Click nature category
    const natureBtn = await page.$('[data-testid="category-nature"]');
    await natureBtn?.click();
    await waitForText(page, '.route-content', 'Nature Gallery');

    // URL should show parameterized hash route
    await new Promise((resolve) => setTimeout(resolve, 300));
    url = page.url;
    const natureHash = await page.evaluate(() => window.location.hash);
    const fullNatureUrl = natureHash ? `${url}${natureHash}` : url;
    assertStringIncludes(
      fullNatureUrl,
      'nature',
      'Hash should contain nature parameter',
    );
  } finally {
    await browser.close();
  }
});

Deno.test('Hash Mode - Link href attributes contain hash prefix', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${HASH_MODE_IP}:${DEFAULT_PORT}`,
    );

    await waitForElement(page, '[data-testid="hash-navigation"]');

    // Check that all navigation links have hash prefixes in href using page.evaluate
    const hrefs = await page.evaluate(() => {
      const homeLink = document.querySelector(
        '[data-testid="hash-home-link"]',
      ) as HTMLAnchorElement;
      const galleryLink = document.querySelector(
        '[data-testid="hash-gallery-link"]',
      ) as HTMLAnchorElement;
      const settingsLink = document.querySelector(
        '[data-testid="hash-settings-link"]',
      ) as HTMLAnchorElement;

      return {
        home: homeLink?.href || homeLink?.getAttribute('href') || null,
        gallery: galleryLink?.href || galleryLink?.getAttribute('href') || null,
        settings: settingsLink?.href || settingsLink?.getAttribute('href') ||
          null,
      };
    });

    assertStringIncludes(
      hrefs.home || '',
      '#/',
      'Home link should contain hash fragment',
    );
    assertStringIncludes(
      hrefs.gallery || '',
      '#/gallery',
      'Gallery link should contain hash fragment',
    );
    assertStringIncludes(
      hrefs.settings || '',
      '#/settings',
      'Settings link should contain hash fragment',
    );
  } finally {
    await browser.close();
  }
});

Deno.test('Hash Mode - Multiple parameters in hash routes', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${HASH_MODE_IP}:${DEFAULT_PORT}`,
    );

    // Setup error reporting
    await setupErrorReporting(page);

    await waitForElement(page, '[data-testid="hash-navigation"]');

    // Navigate to gallery first
    const galleryLink = await page.$('[data-testid="hash-gallery-link"]');
    await galleryLink?.click();
    await waitForText(page, '.route-content', 'Photo Gallery');

    // Click nature category
    const natureBtn = await page.$('[data-testid="category-nature"]');
    await natureBtn?.click();
    await waitForText(page, '.route-content', 'Nature Gallery');

    // Click first photo
    const firstPhoto = await page.$('[data-testid="photo-1"]');
    await firstPhoto?.click();
    await waitForText(page, '.route-content', 'Photo Detail');
    await waitForText(page, '.route-content', 'Photo #1');

    // URL should contain both category and photo ID
    await new Promise((resolve) => setTimeout(resolve, 300));
    const url = page.url;
    const photoHash = await page.evaluate(() => window.location.hash);
    const fullPhotoUrl = photoHash ? `${url}${photoHash}` : url;
    assertStringIncludes(
      fullPhotoUrl,
      'nature',
      'Hash should contain category parameter',
    );
    assertStringIncludes(
      fullPhotoUrl,
      '1',
      'Hash should contain photo ID parameter',
    );

    // Test navigation between photos
    const nextBtn = await page.$('[data-testid="next-photo"]');
    await nextBtn?.click();
    await waitForText(page, '.route-content', 'Photo #2');

    const prevBtn = await page.$('[data-testid="prev-photo"]');
    await prevBtn?.click();
    await waitForText(page, '.route-content', 'Photo #1');
  } finally {
    await browser.close();
  }
});

Deno.test('Hash Mode - Settings form and hash navigation', async () => {
  const browser = await launch({ headless: true });

  try {
    const page = await browser.newPage(
      `http://${HASH_MODE_IP}:${DEFAULT_PORT}`,
    );

    // Setup error reporting
    await setupErrorReporting(page);

    await waitForElement(page, '[data-testid="hash-navigation"]');

    // Navigate to settings
    const settingsLink = await page.$('[data-testid="hash-settings-link"]');
    await settingsLink?.click();
    await waitForText(page, '.route-content', 'Gallery Settings');

    // Interact with form elements using direct DOM manipulation
    await page.evaluate(() => {
      const themeSelect = document.querySelector(
        '[data-testid="theme-select"]',
      ) as HTMLSelectElement;
      if (themeSelect) {
        themeSelect.value = 'dark';
        themeSelect.dispatchEvent(new Event('change'));
      }
    });

    await page.evaluate(() => {
      const photosInput = document.querySelector(
        '[data-testid="photos-per-page"]',
      ) as HTMLInputElement;
      if (photosInput) {
        photosInput.value = '12';
        photosInput.dispatchEvent(new Event('input'));
      }
    });

    const autoplayCheckbox = await page.$('[data-testid="autoplay-checkbox"]');
    await autoplayCheckbox?.click();

    // Submit settings
    const saveBtn = await page.$('[data-testid="save-settings"]');
    await saveBtn?.click();

    // Wait a moment for any processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Navigate back to home
    const backBtn = await page.$('[data-testid="back-to-home"]');
    await backBtn?.click();
    await waitForText(page, '.route-content', 'Hash Mode Home');
  } finally {
    await browser.close();
  }
});
