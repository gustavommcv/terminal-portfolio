import { readFileSync } from 'node:fs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { HomeIntroService } from './features/home/services/home-intro.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-container')).toBeTruthy();
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('offers a skip link that moves focus to the main content', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('.skip-link') as HTMLAnchorElement;
    const main = compiled.querySelector('main') as HTMLElement;
    document.body.append(compiled);

    // It comes before the header, so it is the first stop for the keyboard.
    expect(
      skipLink.compareDocumentPosition(compiled.querySelector('app-header')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(skipLink.textContent?.trim()).toBe('Skip to main content');
    expect(main.id).toBe('main');

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    skipLink.dispatchEvent(click);

    // No navigation to `/#main` (the base href is `/`); focus just moves.
    expect(click.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(main);
    compiled.remove();
  });

  describe('the footer', () => {
    // The pages are empty here: the footer belongs to the shell, not to a page.
    async function visit(url: string): Promise<ComponentFixture<App>> {
      const router = TestBed.inject(Router);
      router.resetConfig([
        { path: '', pathMatch: 'full', children: [] },
        { path: 'about', children: [] },
        { path: '**', children: [] },
      ]);
      const fixture = TestBed.createComponent(App);
      await router.navigateByUrl(url);
      fixture.detectChanges();
      return fixture;
    }

    const footerOf = (fixture: ComponentFixture<App>) =>
      (fixture.nativeElement as HTMLElement).querySelector('footer');

    it.each(['/about', '/portfolio', '/portfolio/mangabound', '/no-such-page'])(
      'closes %s, after the main content and outside it',
      async (url) => {
        const fixture = await visit(url);
        const root = fixture.nativeElement as HTMLElement;
        const footer = footerOf(fixture)!;

        expect(root.querySelectorAll('footer')).toHaveLength(1);
        expect(footer.closest('main')).toBeNull();
        expect(
          root.querySelector('main')!.compareDocumentPosition(footer) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
      },
    );

    it('waits on the home page for the intro to finish, like the rest of the page', async () => {
      const fixture = await visit('/');
      const intro = TestBed.inject(HomeIntroService);

      // Nothing yet: the intro has not been claimed by the page.
      expect(intro.state()).toBe('eligible');
      expect(footerOf(fixture)).toBeNull();

      intro.claim(false);
      fixture.detectChanges();
      expect(intro.state()).toBe('waiting');
      expect(footerOf(fixture)).toBeNull();

      intro.startTyping();
      fixture.detectChanges();
      expect(intro.state()).toBe('typing');
      expect(footerOf(fixture)).toBeNull();

      intro.finishTyping('whoami');
      fixture.detectChanges();
      expect(footerOf(fixture)).not.toBeNull();
    });

    it('is there at once on the home page when there is no intro to wait for', async () => {
      const fixture = await visit('/');

      TestBed.inject(HomeIntroService).claim(true);
      fixture.detectChanges();

      expect(footerOf(fixture)).not.toBeNull();
    });

    it('stays the same element as the visitor moves from page to page', async () => {
      const fixture = await visit('/about');
      const footer = footerOf(fixture);

      await TestBed.inject(Router).navigateByUrl('/portfolio');
      fixture.detectChanges();

      expect(footer).not.toBeNull();
      expect(footerOf(fixture)).toBe(footer);
    });

    it('appears with its final style, with no animation of its own', async () => {
      const fixture = await visit('/about');
      const host = (fixture.nativeElement as HTMLElement).querySelector('app-footer')!;

      expect(host.className).not.toMatch(/reveal|fade|stagger|transition|animation/i);
      expect(host.getAttribute('style')).toBeNull();
    });

    // jsdom does not lay anything out, so this reads the source: the footer
    // goes down to the bottom of the window on a page shorter than it, because
    // the container is at least as tall as the window and the main content
    // takes what is left over. Without both, it hangs under the content.
    it('goes to the bottom of the window on a page shorter than it', () => {
      const scss = readFileSync('src/app/app.scss', 'utf8').replace(/\r\n/g, '\n');

      expect(scss).toMatch(
        /\.app-container\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*min-height:\s*100dvh;/,
      );
      expect(scss).toMatch(/\.main\s*\{\s*flex:\s*1;/);
    });
  });
});
