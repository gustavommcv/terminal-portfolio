import { TestBed } from '@angular/core/testing';
import { UrlSegment } from '@angular/router';
import type { PartialMatchRouteSnapshot, Route } from '@angular/router';

import { projectExistsGuard } from './project-exists.guard';

describe('projectExistsGuard', () => {
  const run = (...paths: string[]) =>
    TestBed.runInInjectionContext(() =>
      projectExistsGuard(
        {} as Route,
        paths.map((p) => new UrlSegment(p, {})),
        {} as PartialMatchRouteSnapshot,
      ),
    );

  it('matches a project id from the catalog', () => {
    expect(run('portfolio', 'maquetaria')).toBe(true);
  });

  it('does not match an unknown id, so the 404 route takes over', () => {
    expect(run('portfolio', 'no-such-project')).toBe(false);
  });

  it('does not match when the id is missing', () => {
    expect(run('portfolio')).toBe(false);
  });
});
