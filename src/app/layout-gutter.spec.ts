import { readFileSync } from 'node:fs';

// The header must be exactly as wide as the sections under it, at every screen
// width. That is a matter of layout, which jsdom does not compute, so this checks
// the source: the header and every page take their side gutter from the same
// mixin. (A hand-written gutter for either one matches the fluid one at a single
// width only: the header was once 35px narrower than the sections at 1120px.)
const read = (path: string) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/** The text between the braces of the first rule that starts with `selector`. */
function ruleOf(scss: string, selector: string): string {
  const start = scss.indexOf(`${selector} {`);
  expect(start, `${selector} is in the file`).toBeGreaterThanOrEqual(0);

  let depth = 0;
  for (let index = scss.indexOf('{', start); index < scss.length; index += 1) {
    if (scss[index] === '{') depth += 1;
    if (scss[index] === '}') depth -= 1;
    if (depth === 0) return scss.slice(scss.indexOf('{', start) + 1, index);
  }
  throw new Error(`${selector} is never closed`);
}

describe('the side gutter of the header and the pages', () => {
  const mixins = read('src/styles/abstracts/_mixins.scss');

  it('is defined once, as a fluid value, by the page-gutter mixin', () => {
    expect(ruleOf(mixins, '@mixin page-gutter')).toMatch(/padding-inline:\s*clamp\(/);
  });

  it('is what page-shell gives every page', () => {
    expect(ruleOf(mixins, '@mixin page-shell')).toContain('@include page-gutter');
  });

  it('is what the sticky header container uses, with no padding of its own', () => {
    const header = ruleOf(read('src/app/app.scss'), '.header-container');

    expect(header).toContain('@include page-gutter');
    expect(header).not.toMatch(/\bpadding(-inline|-left|-right)?\s*:/);
    expect(header).not.toContain('@media');
  });

  it.each([
    'src/app/features/home/home-page/home-page.scss',
    'src/app/features/about/about-page/about-page.scss',
    'src/app/features/portfolio/portfolio-page/portfolio-page.scss',
    'src/app/features/projectDetail/project-detail-page/project-detail-page.scss',
    'src/app/features/error/error-page/error-page.scss',
  ])('is what %s uses', (file) => {
    expect(read(file)).toContain('@include page-shell');
  });
});
