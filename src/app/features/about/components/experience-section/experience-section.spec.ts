import { readFileSync } from 'node:fs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/i18n/language.service';
import { ExperienceSection } from './experience-section';

describe('ExperienceSection', () => {
  let fixture: ComponentFixture<ExperienceSection>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ExperienceSection] });
    fixture = TestBed.createComponent(ExperienceSection);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('distinguishes paid development, the open-source project, and CAD work', () => {
    const entries = Array.from(root.querySelectorAll('article'));
    expect(entries).toHaveLength(3);
    expect(entries[0].textContent).toContain('Professional experience');
    expect(entries[0].textContent).toContain('Apr 2025 – present');
    expect(entries[1].textContent).toContain('Open-source project');
    expect(entries[1].textContent).toContain('Manga2Ink');
    expect(entries[2].textContent).toContain('Additional experience');
    expect(entries[2].textContent).toContain('Projecta Maquetes');
    expect(entries.map((entry) => entry.querySelectorAll('li').length)).toEqual([3, 3, 2]);
  });

  it('links only the experiences with a portfolio project', () => {
    const links = Array.from(root.querySelectorAll('article a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/portfolio/maquetaria', '/portfolio/manga2ink',
    ]);
    expect(root.querySelector('article:last-child a')).toBeNull();
  });

  it('translates the experience and keeps project navigation in Portuguese', async () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('pt', JSON.parse(readFileSync('public/i18n/pt.json', 'utf8')));
    await TestBed.inject(LanguageService).toggleLanguage();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.textContent).toContain('Experiência profissional');
    expect(root.textContent).toContain('abr. 2025 – atual');
    expect(root.textContent).toContain('Experiência complementar');
    expect(Array.from(root.querySelectorAll('article a')).map((link) => link.getAttribute('href')))
      .toEqual(['/portfolio/maquetaria?locale=pt', '/portfolio/manga2ink?locale=pt']);
  });
});
