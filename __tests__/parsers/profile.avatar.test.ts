import { describe, expect, it } from 'vitest';

import { sessionProbeNeedsContextSelection } from '../../app/core/scraper/auth/sessionValidation';
import {
  extractAvatarFromHtml,
  readAvatarFromHtml,
} from '../../app/core/scraper/features/profile/profile.avatar';

const PHOTO_SRC = 'data:image/jpeg;base64,QUJD';

function contextSelectionPage(inner: string): string {
  return `<!DOCTYPE html><html><head><title>Wybór kontekstu logowania</title></head><body>
    <h1>Wybierz kontekst logowania</h1>
    <p>${'Wybierz kontekst logowania. '.repeat(6)}</p>
    ${inner}
  </body></html>`;
}

describe('readAvatarFromHtml', () => {
  it('nie bierze logo z sidebara strony wyboru kontekstu', () => {
    const html = contextSelectionPage(
      '<div class="apr-sidebar-body"><img src="/Content/logo.png" alt=""></div>'
    );

    expect(html.length).toBeGreaterThan(120);
    expect(readAvatarFromHtml(html)).toBe('');
    expect(readAvatarFromHtml(html, '/WyborKontekstu')).toBe('');
  });

  it('bierze #zdjecie_glowne nawet gdy obok jest wybór kontekstu', () => {
    const html = contextSelectionPage(
      `<img id="zdjecie_glowne" src="${PHOTO_SRC}" alt="">`
    );

    expect(readAvatarFromHtml(html)).toBe(PHOTO_SRC);
  });

  it('bierze src awatara ze zwykłej strony', () => {
    const html = `<!DOCTYPE html><html><body>
      <img id="zdjecie_glowne" src="${PHOTO_SRC}" alt="">
    </body></html>`;

    expect(extractAvatarFromHtml(html)).toBe(PHOTO_SRC);
    expect(readAvatarFromHtml(html)).toBe(PHOTO_SRC);
  });
});

describe('sessionProbeNeedsContextSelection', () => {
  it('odrzuca HTML i URL wyboru kontekstu', () => {
    const html = contextSelectionPage('<p>Student</p>');

    expect(sessionProbeNeedsContextSelection(html)).toBe(true);
    expect(sessionProbeNeedsContextSelection(html, '/WyborKontekstu')).toBe(
      true
    );
    expect(
      sessionProbeNeedsContextSelection(
        '<html><body>panel studenta bez wyboru</body></html>',
        'https://wd.ans-ns.edu.pl/'
      )
    ).toBe(false);
    expect(
      sessionProbeNeedsContextSelection('ok', '/Konto/WyborKontekstu')
    ).toBe(true);
  });
});
