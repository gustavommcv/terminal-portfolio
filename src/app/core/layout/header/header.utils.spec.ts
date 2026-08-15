import { routeIcon, routeLabel } from './header.utils';

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
