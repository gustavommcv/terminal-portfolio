import type { NeoTreeIconName } from '../../shared/neo-tree-icon/neo-tree-icon';

/** Derives the visible nav label from a route path, e.g. '/about' -> 'about'. */
export function routeLabel(route: string): string {
  return route === '/' ? 'home' : route.slice(1);
}

/** Maps a route path to the icon that best represents it in the Neo-tree nav. */
export function routeIcon(route: string): NeoTreeIconName {
  switch (route) {
    case '/':
      return 'home';
    case '/about':
      return 'about';
    case '/portfolio':
      return 'folder';
    default:
      return 'about';
  }
}
