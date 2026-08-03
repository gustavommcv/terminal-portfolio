/** Derives the visible nav label from a route path, e.g. '/about' -> 'about'. */
export function routeLabel(route: string): string {
  return route === '/' ? 'home' : route.slice(1);
}
