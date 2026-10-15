import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import {
  BuildOutputError,
  checkCaching,
  createBuildOutput,
  pageDirectories,
  routingTable,
} from './build-output.mjs';
import { headerRoutes } from './header-routes.mjs';

const vercelHeaders = JSON.parse(
  readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'),
).headers;

describe('the build output', () => {
  let workspace;
  let dist;
  let output;

  /** Makes empty files (and the folders they are in) under the dist directory. */
  const files = (...names) => {
    for (const name of names) {
      const path = join(dist, name);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, `content of ${name}`);
    }
  };
  const make = (options = {}) =>
    createBuildOutput({ distDirectory: dist, buildOutput: output, headers: vercelHeaders, ...options });
  const config = () => JSON.parse(readFileSync(join(output, 'config.json'), 'utf8'));

  beforeEach(() => {
    workspace = mkdtempSync(join(tmpdir(), 'build-output-'));
    dist = join(workspace, 'dist');
    output = join(workspace, '.vercel', 'output');
    mkdirSync(dist, { recursive: true });
    files('404/index.html', 'index.html', 'about/index.html', 'main-ABCDEFGH.js', 'styles-ABCDEFGH.css', 'i18n/en.json');
  });

  afterEach(() => rmSync(workspace, { recursive: true, force: true }));

  describe('createBuildOutput', () => {
    it('copies the prerendered 404 page to the top level, and the site under static', () => {
      make();

      assert.equal(readFileSync(join(dist, '404.html'), 'utf8'), 'content of 404/index.html');
      assert.ok(existsSync(join(output, 'static', 'main-ABCDEFGH.js')));
      assert.ok(existsSync(join(output, 'static', 'about', 'index.html')));
      assert.ok(existsSync(join(output, 'static', '404.html')));
    });

    it('writes a version 3 config: headers first, then the pages, the files, and a real 404', () => {
      const summary = make();
      const { version, routes } = config();

      assert.equal(version, 3);
      assert.equal(summary.headerRules, vercelHeaders.length);
      assert.equal(summary.pages, 2); // about and 404
      // the headers carry on to the next route
      assert.ok(routes.slice(0, vercelHeaders.length).every((route) => route.continue === true && route.headers));
      assert.deepEqual(routes.slice(-3), [
        { handle: 'filesystem' },
        { handle: 'error' },
        { status: 404, src: '^(?!/api).*$', dest: '/404.html' },
      ]);
    });

    it('serves each page at its own address without a redirect, including a trailing slash', () => {
      make();
      const pageRoutes = config().routes.filter((route) => route.dest?.endsWith('/index.html'));

      assert.deepEqual(
        pageRoutes.map((route) => [route.src, route.dest]).sort(),
        [
          ['^/404/?$', '/404/index.html'],
          ['^/about/?$', '/about/index.html'],
        ],
      );
      assert.ok(new RegExp(pageRoutes[1].src).test('/about'));
      assert.ok(new RegExp(pageRoutes[1].src).test('/about/'));
    });

    it('replaces an earlier output instead of adding to it', () => {
      files('old-page/index.html');
      make();
      assert.ok(existsSync(join(output, 'static', 'old-page', 'index.html')));

      rmSync(join(dist, 'old-page'), { recursive: true });
      make();

      assert.equal(existsSync(join(output, 'static', 'old-page')), false);
      assert.ok(!config().routes.some((route) => route.dest === '/old-page/index.html'));
    });

    it('refuses to go on without the prerendered 404 page, and says which route to check', () => {
      rmSync(join(dist, '404'), { recursive: true });

      assert.throws(make, (error) => error instanceof BuildOutputError && /app\.routes\.server\.ts/.test(error.message));
    });

    it('refuses to deploy without any security headers', () => {
      assert.throws(() => make({ headers: [] }), /refusing to deploy without security headers/);
      assert.throws(() => make({ headers: undefined }), /refusing to deploy without security headers/);
    });

    it('fails on a header rule it cannot translate, instead of building a route that matches wrongly', () => {
      assert.throws(
        () => make({ headers: [{ source: '/:file', headers: [{ key: 'X-A', value: '1' }] }] }),
        (error) => error instanceof BuildOutputError && /path-to-regexp/.test(error.message),
      );
    });

    it('refuses an immutable file whose name has no content hash', () => {
      files('main-abc.js');

      assert.throws(make, (error) => error instanceof BuildOutputError && /main-abc\.js.*no content hash/.test(error.message));
      assert.equal(existsSync(join(output, 'config.json')), false, 'nothing is published');
    });

    it('warns about a script no long-cache rule covers, but carries on', () => {
      files('worker.js');
      const warnings = [];

      make({ warn: (message) => warnings.push(message) });

      assert.equal(warnings.length, 1);
      assert.match(warnings[0], /worker\.js/);
      assert.ok(existsSync(join(output, 'config.json')));
    });

    it('is quiet when every script and stylesheet is covered', () => {
      const warnings = [];

      make({ warn: (message) => warnings.push(message) });

      assert.deepEqual(warnings, []);
    });
  });

  describe('pageDirectories', () => {
    it('finds the folders that hold an index.html, nested ones with their full path', () => {
      files('portfolio/index.html', 'portfolio/mangabound/index.html');

      assert.deepEqual(pageDirectories(dist).sort(), ['404', 'about', 'portfolio', 'portfolio/mangabound']);
    });

    it('leaves out folders of assets, and folders with no index.html of their own', () => {
      files('images/me.webp', 'fonts/a.woff2', 'group/child/index.html');

      assert.deepEqual(pageDirectories(dist).sort(), ['404', 'about', 'group/child']);
    });
  });

  describe('routingTable', () => {
    it('escapes what a folder name could mean in a regular expression', () => {
      const [route] = routingTable([], ['v1.0']).filter((r) => r.dest);

      assert.equal(route.src, '^/v1\\.0/?$');
      assert.equal(new RegExp(route.src).test('/v1.0'), true);
      assert.equal(new RegExp(route.src).test('/v1x0'), false);
    });

    it('has only the file lookup and the 404 when there are no pages', () => {
      assert.deepEqual(routingTable([], []).map((route) => route.handle ?? route.status), ['filesystem', 'error', 404]);
    });
  });

  describe('checkCaching', () => {
    const routes = headerRoutes(vercelHeaders);

    it('accepts hashes made of letters, digits, "-" and "_"', () => {
      files('chunk-BRbYvK-6.js', 'chunk-QT48a_Zz.js');

      assert.deepEqual(checkCaching(dist, routes), { errors: [], warnings: [] });
    });

    it('ignores folders, whatever their name', () => {
      files('main-nothash/index.html');

      assert.deepEqual(checkCaching(dist, routes).errors, []);
    });

    it('reports a bundle name with a hash that is too short', () => {
      files('chunk-short.js');

      assert.equal(checkCaching(dist, routes).errors.length, 1);
    });
  });
});
