import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

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
});
