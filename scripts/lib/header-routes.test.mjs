import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { headerRoutes, headersFor, sourceToRegExp } from './header-routes.mjs';

const vercelConfig = JSON.parse(
  readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'),
);

describe('sourceToRegExp', () => {
  it('turns the match-everything source into an anchored expression', () => {
    const pattern = new RegExp(sourceToRegExp('/(.*)'));

    for (const path of ['/', '/about', '/portfolio/mangabound', '/a/b.js']) {
      assert.ok(pattern.test(path), path);
    }
  });

  it('anchors the whole path, so a source cannot match part of one', () => {
    const pattern = new RegExp(sourceToRegExp('/((?:chunk|main)-[a-z]+\\.js)'));

    assert.ok(pattern.test('/chunk-abc.js'));
    assert.ok(!pattern.test('/nested/chunk-abc.js'));
    assert.ok(!pattern.test('/chunk-abc.js.map'));
    assert.ok(!pattern.test('/chunk-abc.json'));
  });

  it('matches literal text literally, including the dots', () => {
    const pattern = new RegExp(sourceToRegExp('/robots.txt'));

    assert.ok(pattern.test('/robots.txt'));
    assert.ok(!pattern.test('/robotsXtxt'));
  });

  it('keeps nested groups together', () => {
    const pattern = new RegExp(sourceToRegExp('/((?:fonts/|images/).*|tux\\.ico)'));

    assert.ok(pattern.test('/fonts/a.woff2'));
    assert.ok(pattern.test('/images/projects/x.webp'));
    assert.ok(pattern.test('/tux.ico'));
    assert.ok(!pattern.test('/tuxXico'));
    assert.ok(!pattern.test('/cv/cv-en.pdf'));
  });

  for (const [name, source] of [
    ['a named parameter', '/:file'],
    ['a wildcard', '/assets/*'],
    ['a one-or-more modifier', '/assets/x+'],
    ['an optional modifier', '/assets/x?'],
    ['a source without a leading slash', 'assets/(.*)'],
    ['an unclosed group', '/(.*'],
  ]) {
    it(`refuses ${name}, instead of building a route that matches something else`, () => {
      assert.throws(() => sourceToRegExp(source));
    });
  }
});

describe('headerRoutes', () => {
  it('refuses has/missing conditions it cannot honour', () => {
    assert.throws(() =>
      headerRoutes([
        { source: '/(.*)', has: [{ type: 'host', value: 'x' }], headers: [] },
      ]),
    );
  });

  it('lets the request carry on to the next route', () => {
    const [route] = headerRoutes([
      { source: '/(.*)', headers: [{ key: 'X-A', value: '1' }] },
    ]);

    assert.equal(route.continue, true);
    assert.deepEqual(route.headers, { 'X-A': '1' });
  });
});

describe('vercel.json header rules', () => {
  const routes = headerRoutes(vercelConfig.headers);
  const cacheControl = (path) => headersFor(routes, path)['Cache-Control'];

  it('puts the security headers on every response, whatever the path', () => {
    for (const path of ['/', '/about', '/chunk-B93UiPfi.js', '/missing', '/images/a.webp']) {
      const headers = headersFor(routes, path);

      assert.ok(headers['Strict-Transport-Security'], path);
      assert.ok(headers['Content-Security-Policy'], path);
      assert.equal(headers['X-Content-Type-Options'], 'nosniff', path);
    }
  });

  it('lets images come from the site itself and nowhere else', () => {
    const policy = headersFor(routes, '/')['Content-Security-Policy'];
    const imageSources = policy
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .find(([name]) => name === 'img-src')
      .slice(1);

    // The badges used to come from img.shields.io, which told that service who
    // was looking at the site. They are files in public/images/badges now.
    assert.deepEqual(imageSources, ["'self'", 'data:']);
  });

  it('caches the hashed bundles for a year, as immutable', () => {
    for (const path of [
      '/main-T3ZX3BYX.js',
      '/polyfills-LVNOU2XZ.js',
      '/styles-VMKHN2JJ.css',
      '/chunk-B93UiPfi.js',
      '/chunk-BRbYvK-6.js', // the hash can contain "-" and "_"
      '/chunk-QT48a_Zz.js',
    ]) {
      assert.equal(cacheControl(path), 'public, max-age=31536000, immutable', path);
    }
  });

  it('never marks a file as immutable unless its name carries a hash', () => {
    for (const path of [
      '/',
      '/about',
      '/portfolio/mangabound',
      '/index.html',
      '/index.csr.html',
      '/404.html',
      '/sitemap.xml',
      '/robots.txt',
      '/i18n/en.json',
      '/i18n/pt.json',
      '/cv/cv-en.pdf',
      '/images/me.webp',
      '/fonts/jetbrains-mono-latin.woff2',
      '/tux.ico',
      '/main.js',
      '/chunk-.js',
      '/nested/chunk-B93UiPfi.js',
    ]) {
      assert.ok(
        !(cacheControl(path) ?? '').includes('immutable'),
        `${path} would be cached forever`,
      );
    }
  });

  it('keeps the page, the catalogs and the CVs revalidated, so an edit shows at once', () => {
    for (const path of ['/', '/about', '/index.html', '/404.html', '/i18n/en.json', '/cv/cv-pt.pdf', '/sitemap.xml']) {
      assert.equal(cacheControl(path), undefined, path);
    }
  });

  it('caches fonts and images for a day, then serves them stale while it refreshes', () => {
    for (const path of ['/fonts/jetbrains-mono-latin.woff2', '/images/me.webp', '/images/projects/mangabound/images/mangabound-cover.webp', '/tux.ico']) {
      assert.equal(cacheControl(path), 'public, max-age=86400, stale-while-revalidate=604800', path);
    }
  });
});
