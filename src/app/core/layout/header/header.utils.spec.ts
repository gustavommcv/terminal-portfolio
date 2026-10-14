import { NAV_ROUTES, routeIcon, routeLabel } from './header.utils';

describe('routeLabel', () => {
  it('labels the root route as home', () => {
    expect(routeLabel('/')).toBe('home');
  });

  it('strips the leading slash for other routes', () => {
    expect(routeLabel('/about')).toBe('about');
    expect(routeLabel('/portfolio')).toBe('portfolio');
  });
});

describe('routeIcon', () => {
  it('maps each nav route to a distinct icon', () => {
    expect(routeIcon('/')).toBe('home');
    expect(routeIcon('/about')).toBe('about');
    expect(routeIcon('/portfolio')).toBe('folder');
  });
});

describe('NAV_ROUTES', () => {
  it('lists each page once, starting with home', () => {
    expect(NAV_ROUTES[0]).toBe('/');
    expect(new Set(NAV_ROUTES).size).toBe(NAV_ROUTES.length);
  });

  it('gives every route its own label and icon, so none falls back to the default', () => {
    const labels = NAV_ROUTES.map((route) => routeLabel(route));
    const icons = NAV_ROUTES.map((route) => routeIcon(route));

    expect(new Set(labels).size).toBe(NAV_ROUTES.length);
    expect(new Set(icons).size).toBe(NAV_ROUTES.length);
  });
});
