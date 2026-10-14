import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ErrorPage } from './error-page';

describe('ErrorPage', () => {
  let fixture: ComponentFixture<ErrorPage>;

  async function renderAt(url: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ErrorPage],
    }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'url', 'get').mockReturnValue(url);

    fixture = TestBed.createComponent(ErrorPage);
    fixture.detectChanges();
  }

  it('should create', async () => {
    await renderAt('/missing');

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the translated message for the missing path', async () => {
    await renderAt('/missing');
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('404 - Command not found');
    expect(text).toContain('bash: /missing: command not found');
  });

  it('leaves the query string and fragment out of the missing path', async () => {
    await renderAt('/missing?locale=pt#top');

    expect(fixture.componentInstance.currentPath).toBe('/missing');
    expect(fixture.nativeElement.textContent).not.toContain('locale=pt');
  });
});
