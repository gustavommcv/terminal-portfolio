import { projectCardImage } from './project-media';

describe('projectCardImage', () => {
  const gallery: [string, ...string[]] = ['first.webp', 'second.webp'];

  it('shows the cover on cards when a project has one', () => {
    expect(projectCardImage({ cover: 'cover.webp', gallery })).toBe(
      'cover.webp',
    );
  });

  it('falls back to the first gallery image on cards when there is no cover', () => {
    expect(projectCardImage({ gallery })).toBe('first.webp');
  });
});
