import {
  DefaultUrlSerializer,
  RouterStateSnapshot,
  RoutesRecognized,
} from '@angular/router';
import { Subject } from 'rxjs';

/** Minimal Router surface for deterministic initial-navigation lifecycle tests. */
export class InitialNavigationRouterStub {
  readonly events = new Subject<RoutesRecognized>();
  readonly serializer = new DefaultUrlSerializer();
  navigated = false;
  url = '/';

  parseUrl(url: string) {
    return this.serializer.parse(url);
  }

  createUrlTree(
    commands: readonly unknown[],
    options: { queryParams?: Record<string, unknown> } = {},
  ) {
    const path = commands
      .map((command) => String(command))
      .join('/')
      .replace(/^\/+/, '');
    const tree = this.parseUrl(`/${path}`);
    tree.queryParams = options.queryParams ?? {};
    return tree;
  }

  serializeUrl(url: ReturnType<InitialNavigationRouterStub['parseUrl']>): string {
    return this.serializer.serialize(url);
  }

  navigate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  hydrateAt(url: string): void {
    this.url = url;
    this.navigated = true;
  }

  recognize(initialUrl: string, urlAfterRedirects = initialUrl): void {
    this.url = urlAfterRedirects;
    this.events.next(
      new RoutesRecognized(
        1,
        initialUrl,
        urlAfterRedirects,
        {} as RouterStateSnapshot,
      ),
    );
    this.navigated = true;
  }
}
