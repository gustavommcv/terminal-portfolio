import { routeLabel } from './header.utils';

describe('routeLabel', () => {
  it('labels the root route as home', () => {
    expect(routeLabel('/')).toBe('home');
  });

  it('strips the leading slash for other routes', () => {
    expect(routeLabel('/about')).toBe('about');
    expect(routeLabel('/portfolio')).toBe('portfolio');
  });
});
