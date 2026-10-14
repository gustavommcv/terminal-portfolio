import { Project } from './projects.data';

/** Image for a project's card: its cover if it has one, else its first gallery image. */
export function projectCardImage(
  project: Pick<Project, 'cover' | 'gallery'>,
): string {
  return project.cover ?? project.gallery[0];
}
