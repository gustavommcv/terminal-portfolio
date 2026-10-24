import { ComponentFixture, TestBed } from '@angular/core/testing';

import { projectsData } from '../../../../data/projects.data';
import { ProjectGallery } from './project-gallery';

const galleryOf = (id: string): readonly string[] =>
  projectsData.find((project) => project.id === id)!.gallery;

function createGallery(images: readonly string[], alt = 'A project'): ComponentFixture<ProjectGallery> {
  TestBed.configureTestingModule({ imports: [ProjectGallery] });

  const fixture = TestBed.createComponent(ProjectGallery);
  fixture.componentRef.setInput('images', images);
  fixture.componentRef.setInput('alt', alt);
  fixture.detectChanges();
  return fixture;
}

describe('ProjectGallery', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  const several = galleryOf('maquetaria');
  const single = galleryOf('gomodoro');

  const root = (f: ComponentFixture<ProjectGallery>): HTMLElement => f.nativeElement;
  const main = (f: ComponentFixture<ProjectGallery>): HTMLImageElement =>
    root(f).querySelector('.project-gallery__thumbnail')!;
  const thumbs = (f: ComponentFixture<ProjectGallery>): HTMLButtonElement[] =>
    Array.from(root(f).querySelectorAll('.project-gallery__thumb'));

  describe('the image on show', () => {
    it('is the first one, with the name of the project as its alt text', () => {
      const fixture = createGallery(several, 'Veronese Maquetes');

      expect(main(fixture).getAttribute('src')).toBe(several[0]);
      expect(main(fixture).alt).toBe('Veronese Maquetes');
      expect(main(fixture).getAttribute('width')).toBe('640');
      expect(main(fixture).getAttribute('height')).toBe('360');
    });

    it('loads at high priority, while the thumbnails stay lazy', () => {
      const fixture = createGallery(several);

      expect(main(fixture).getAttribute('fetchpriority')).toBe('high');
      expect(main(fixture).getAttribute('loading')).toBe('eager');

      const strip = Array.from(root(fixture).querySelectorAll('.project-gallery__thumb img')) as HTMLImageElement[];
      expect(strip.length).toBeGreaterThan(1);
      expect(strip.every((img) => img.getAttribute('loading') === 'lazy')).toBe(true);
    });

    it('goes back to the first one when the images change', () => {
      const fixture = createGallery(several);
      thumbs(fixture)[2].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selectedIndex()).toBe(2);

      fixture.componentRef.setInput('images', galleryOf('manga2ink'));
      fixture.detectChanges();

      expect(fixture.componentInstance.selectedIndex()).toBe(0);
      expect(main(fixture).getAttribute('src')).toBe(galleryOf('manga2ink')[0]);
    });
  });

  describe('the thumbnail strip', () => {
    it('has one button for each image, starting on the first', () => {
      const fixture = createGallery(several);

      expect(thumbs(fixture)).toHaveLength(several.length);
      expect(thumbs(fixture)[0].getAttribute('aria-pressed')).toBe('true');
      expect(thumbs(fixture).slice(1).every((t) => t.getAttribute('aria-pressed') === 'false')).toBe(true);
      expect(thumbs(fixture).every((t) => t.getAttribute('type') === 'button')).toBe(true);
      expect(thumbs(fixture).every((t) => t.querySelector('img')?.alt === '')).toBe(true);
    });

    it('swaps the main image when another thumbnail is chosen', () => {
      const fixture = createGallery(several);

      thumbs(fixture)[1].click();
      fixture.detectChanges();

      expect(main(fixture).getAttribute('src')).toBe(several[1]);
      expect(thumbs(fixture)[0].getAttribute('aria-pressed')).toBe('false');
      expect(thumbs(fixture)[1].getAttribute('aria-pressed')).toBe('true');
    });

    it('is not shown for a single image', () => {
      const fixture = createGallery(single);

      expect(root(fixture).querySelector('.project-gallery__thumbs')).toBeNull();
    });
  });

  describe('full screen lightbox', () => {
    // jsdom does not implement the modal <dialog> API, so give it the
    // minimal behaviour the component relies on.
    beforeAll(() => {
      const proto = HTMLDialogElement.prototype;
      proto.showModal = function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      };
      proto.close = function (this: HTMLDialogElement) {
        if (this.hasAttribute('open')) {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        }
      };
    });

    const dialog = (f: ComponentFixture<ProjectGallery>) =>
      root(f).querySelector('.project-gallery__lightbox') as HTMLDialogElement;
    const lightboxImage = (f: ComponentFixture<ProjectGallery>) =>
      root(f).querySelector('.project-gallery__lightbox-image') as HTMLImageElement | null;
    const click = (f: ComponentFixture<ProjectGallery>, selector: string) => {
      (root(f).querySelector(selector) as HTMLElement).click();
      f.detectChanges();
    };

    it('is named after the project', () => {
      expect(dialog(createGallery(several, 'Veronese Maquetes')).getAttribute('aria-label')).toBe('Veronese Maquetes');
    });

    it('makes the main image a button that opens the current image in a modal dialog', () => {
      const fixture = createGallery(several);

      expect(dialog(fixture).hasAttribute('open')).toBe(false);

      click(fixture, '.project-gallery__expand');

      expect(dialog(fixture).hasAttribute('open')).toBe(true);
      expect(lightboxImage(fixture)?.getAttribute('src')).toBe(several[0]);
    });

    it('closes from the close button', () => {
      const fixture = createGallery(several);
      click(fixture, '.project-gallery__expand');

      click(fixture, '.project-gallery__lightbox-close');

      expect(dialog(fixture).hasAttribute('open')).toBe(false);
    });

    it('closes when the empty area around the image is clicked, but not when the image is', () => {
      const fixture = createGallery(several);
      click(fixture, '.project-gallery__expand');

      click(fixture, '.project-gallery__lightbox-image');
      expect(dialog(fixture).hasAttribute('open')).toBe(true);

      click(fixture, '.project-gallery__lightbox-stage');
      expect(dialog(fixture).hasAttribute('open')).toBe(false);
    });

    it('steps through the images with the buttons, wrapping around, in sync with the thumbnails', () => {
      const fixture = createGallery(several);
      click(fixture, '.project-gallery__expand');

      click(fixture, '.project-gallery__lightbox-next');
      expect(lightboxImage(fixture)?.getAttribute('src')).toBe(several[1]);

      click(fixture, '.project-gallery__lightbox-prev');
      click(fixture, '.project-gallery__lightbox-prev');
      expect(lightboxImage(fixture)?.getAttribute('src')).toBe(several[several.length - 1]);
      expect(thumbs(fixture)[several.length - 1].getAttribute('aria-pressed')).toBe('true');
    });

    it('counts where it is among the images', () => {
      const fixture = createGallery(several);
      click(fixture, '.project-gallery__expand');

      expect(root(fixture).querySelector('.project-gallery__lightbox-count')?.textContent?.trim()).toBe(
        `1 / ${several.length}`,
      );
    });

    it('steps through the images with the arrow keys', () => {
      const fixture = createGallery(several);
      click(fixture, '.project-gallery__expand');

      dialog(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      fixture.detectChanges();

      expect(lightboxImage(fixture)?.getAttribute('src')).toBe(several[1]);
    });

    it('offers no previous/next controls for a single image', () => {
      const fixture = createGallery(single);
      click(fixture, '.project-gallery__expand');

      expect(root(fixture).querySelector('.project-gallery__lightbox-next')).toBeNull();
      expect(root(fixture).querySelector('.project-gallery__lightbox-prev')).toBeNull();
      expect(lightboxImage(fixture)).not.toBeNull();
    });
  });

  describe('browsing with the arrow keys', () => {
    const press = (fixture: ComponentFixture<ProjectGallery>, key: string): void => {
      root(fixture)
        .querySelector('dialog')!
        .dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    };

    it('goes back with the left arrow, from the first image round to the last', () => {
      const fixture = createGallery(several);

      press(fixture, 'ArrowLeft');
      expect(fixture.componentInstance.selectedIndex()).toBe(several.length - 1);

      press(fixture, 'ArrowLeft');
      expect(fixture.componentInstance.selectedIndex()).toBe(several.length - 2);
    });

    it('goes forward with the right arrow, from the last image round to the first', () => {
      const fixture = createGallery(several);
      fixture.componentInstance.selectedIndex.set(several.length - 1);

      press(fixture, 'ArrowRight');

      expect(fixture.componentInstance.selectedIndex()).toBe(0);
    });

    it('leaves the image alone for any other key', () => {
      const fixture = createGallery(several);

      for (const key of ['Enter', 'a', 'ArrowUp', 'Tab']) {
        press(fixture, key);
      }

      expect(fixture.componentInstance.selectedIndex()).toBe(0);
    });

    it('does nothing for a single image, since there is nowhere to go', () => {
      const fixture = createGallery(single);

      press(fixture, 'ArrowRight');
      press(fixture, 'ArrowLeft');

      expect(fixture.componentInstance.selectedIndex()).toBe(0);
    });
  });
});
