import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catalogEntry } from '../../../../../testing/english-catalog';
import { ContactSection } from './contact-section';

describe('ContactSection', () => {
  let fixture: ComponentFixture<ContactSection>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ContactSection] });
    fixture = TestBed.createComponent(ContactSection);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('shows the section title, the availability note and the invitation from the catalog', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      catalogEntry('home-page.contact-section.title'),
    );
    expect(root.querySelector('.contact-section__warning')?.textContent?.trim()).toBe(
      catalogEntry('home-page.contact-section.warning'),
    );
    expect(root.querySelector('.contact-section__paragraph')?.textContent?.trim()).toBe(
      catalogEntry('home-page.contact-section.paragraph'),
    );
  });

  it('is the target of the "contact" button on the home page', () => {
    expect(root.querySelector('#contact-section')).not.toBeNull();
  });

  it('links the email address with mailto and shows the address whole', () => {
    const link = root.querySelector('a[href^="mailto:"]') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('mailto:monnerat.gustavo@outlook.com');
    expect(link.textContent?.replace(/\s/g, '')).toBe('monnerat.gustavo@outlook.com');
  });

  it('lets the address wrap at its punctuation, with nothing but line-break hints added', () => {
    const link = root.querySelector('a[href^="mailto:"]') as HTMLAnchorElement;
    const added = Array.from(link.querySelectorAll('*'));

    expect(added.length).toBeGreaterThan(0);
    expect(added.every((element) => element.tagName === 'WBR')).toBe(true);
  });

  it('links the phone number with tel', () => {
    const link = root.querySelector('a[href^="tel:"]') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('tel:+5541991892192');
    expect(link.textContent?.trim()).toBe('+5541991892192');
  });

  describe('formatEmail', () => {
    it('never changes the text a visitor reads, only where it may break', () => {
      for (const address of [
        'monnerat.gustavo@outlook.com',
        'first_last@example.org',
        'someone@else.dev',
      ]) {
        const formatted = fixture.componentInstance.formatEmail(address);

        expect(formatted.replace(/<wbr>/g, '')).toBe(address);
      }
    });

    it('adds a break opportunity after "@" and "_" and before each dot', () => {
      const formatted = fixture.componentInstance.formatEmail('a_b@c.d');

      expect(formatted).toBe('a_<wbr>b@<wbr>c<wbr>.d');
    });
  });
});
