import { existsSync } from 'node:fs';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBadge, projectsData } from '../../../../data/projects.data';
import { badgeFileName } from './badge-file';
import { ProjectBadges } from './project-badges';

describe('ProjectBadges', () => {
  let fixture: ComponentFixture<ProjectBadges>;

  const cloudflareBadge: ProjectBadge = {
    label: 'Cloudflare',
    slug: 'cloudflare',
    color: 'F38020',
    logoColor: 'white',
    category: 'hosting',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProjectBadges] });
    fixture = TestBed.createComponent(ProjectBadges);
  });

  it('renders no list when there are no badges, leaving no empty container', () => {
    fixture.componentRef.setInput('badges', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
    expect(fixture.nativeElement.querySelector('.project-badges')).toBeNull();
  });

  it('renders one image per badge, built from structured data', () => {
    fixture.componentRef.setInput('badges', [cloudflareBadge]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.project-badges__item');
    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-badges__image',
    );

    expect(items).toHaveLength(1);
    expect(img.getAttribute('src')).toBe('images/badges/cloudflare.svg');
    expect(img.getAttribute('alt')).toBe('Cloudflare');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('renders multiple badges in order and gives the list an accessible label', () => {
    const vercelBadge: ProjectBadge = {
      label: 'Vercel',
      slug: 'vercel',
      color: '000000',
      logoColor: 'white',
      category: 'hosting',
    };
    fixture.componentRef.setInput('badges', [cloudflareBadge, vercelBadge]);
    fixture.detectChanges();

    const list: HTMLUListElement = fixture.nativeElement.querySelector('ul');
    const images = Array.from(
      fixture.nativeElement.querySelectorAll('.project-badges__image'),
    ) as HTMLImageElement[];

    expect(list.getAttribute('aria-label')).toBeTruthy();
    expect(images.map((img) => img.getAttribute('alt'))).toEqual([
      'Cloudflare',
      'Vercel',
    ]);
  });

  it('prefers an explicit description over the label for the accessible name', () => {
    const badge: ProjectBadge = {
      ...cloudflareBadge,
      description: 'Deployed on Cloudflare',
    };
    fixture.componentRef.setInput('badges', [badge]);
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-badges__image',
    );
    expect(img.getAttribute('alt')).toBe('Deployed on Cloudflare');
  });

  it('serves the badge from the site, never from a third party', () => {
    fixture.componentRef.setInput('badges', [cloudflareBadge]);
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector(
      '.project-badges__image',
    );
    expect(img.getAttribute('src')).not.toMatch(/^(https?:)?\/\//);
  });

  it('names the file after the label when the badge has no logo slug', () => {
    expect(badgeFileName({ label: 'Node.js - Server', color: '339933' })).toBe(
      'node-js-server',
    );
    expect(badgeFileName({ label: 'Go', slug: 'go', color: '00ADD8' })).toBe('go');
  });

  it('has an SVG file for every badge a project shows', () => {
    const missing = projectsData
      .flatMap((project) => project.badges ?? [])
      .map((badge) => `public/images/badges/${badgeFileName(badge)}.svg`)
      .filter((path) => !existsSync(path));

    // Run `npm run badges` to make them.
    expect(missing).toEqual([]);
  });
});
