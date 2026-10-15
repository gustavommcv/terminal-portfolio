import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catalogEntry } from '../../../../../testing/english-catalog';
import { ServicesSection } from './services-section';

describe('ServicesSection', () => {
  let fixture: ComponentFixture<ServicesSection>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ServicesSection] });
    fixture = TestBed.createComponent(ServicesSection);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('shows the section title from the catalog', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      catalogEntry('home-page.services-section.subtitle'),
    );
  });

  it('lists every service of the catalog, in its order', () => {
    const services = catalogEntry<string[]>('home-page.services-section.services');
    const shown = Array.from(root.querySelectorAll('.services-section__item')).map(
      (item) => item.textContent?.trim(),
    );

    expect(services.length).toBeGreaterThan(0);
    expect(shown).toEqual(services);
  });

  it('invites the visitor to the portfolio with a real link', () => {
    const link = root.querySelector('app-button a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/portfolio');
    expect(link.textContent?.trim()).toBe(
      catalogEntry('home-page.services-section.button'),
    );
  });
});
