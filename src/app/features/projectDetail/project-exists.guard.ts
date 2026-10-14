import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';

import { ProjectsDataService } from '../../services/projects-data.service';

/**
 * Lets `portfolio/:id` match only ids that exist, so an unknown one falls
 * through to the catch-all route and shows the not-found page instead of an
 * empty project page.
 */
export const projectExistsGuard: CanMatchFn = (_route, segments) => {
  const id = segments[1]?.path ?? '';
  return inject(ProjectsDataService).getProjectById(id) !== undefined;
};
