import { describe, expect, it } from 'vitest';

import { EVENTS_DEPARTMENTS } from '../../app/core/scraper/events/events.constants';
import { resolveDepartmentPanelColor } from '../../app/features/dashboard/eventsPanelColor';
import { darkGradesColors } from '../../app/features/grades/gradesTheme';
import { darkAnsColors as c } from '../../app/theme/ansTheme';
import { contrastRatio, darkenHex, withAlpha } from '../../app/theme/colorUtils';
import { featureAccents } from '../../app/theme/featureAccents';
import { darkLessonTypeColors } from '../../app/theme/lessonTypeTheme';

/** WCAG AA: tekst 4.5:1, ikony / duże elementy 3:1. */
const AA_TEXT = 4.5;
const AA_GRAPHIC = 3;

type Pair = [label: string, foreground: string, background: string];

function expectContrast(pairs: Pair[], minimum: number) {
  for (const [label, foreground, background] of pairs) {
    const ratio = contrastRatio(foreground, background);
    expect(ratio, `${label}: ${foreground} na ${background} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      minimum
    );
  }
}

describe('colorUtils', () => {
  it('computes WCAG contrast', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('darkens without changing hue proportions', () => {
    expect(darkenHex('#C86432', 0.5)).toBe('#643219');
  });

  it('appends alpha channel', () => {
    expect(withAlpha('#548DF3', 0.12)).toBe('#548DF31F');
  });
});

describe('dark theme contrast', () => {
  it('base text is readable on every layer', () => {
    const layers = [c.background, c.dashboardBg, c.surface, c.surfaceRaised];
    const pairs: Pair[] = layers.flatMap((layer) => [
      ['charcoal', c.charcoal, layer] as Pair,
      ['gray', c.gray, layer] as Pair,
      ['grayLight', c.grayLight, layer] as Pair,
    ]);
    expectContrast(pairs, AA_TEXT);
  });

  it('accent text tokens are readable on cards', () => {
    expectContrast(
      [
        ['gold', c.gold, c.surface],
        ['goldDark', c.goldDark, c.surface],
        ['error', c.error, c.surface],
        ['error on errorBg', c.error, c.errorBg],
        ['successText', c.successText, c.surface],
        ['attachmentAccent', c.attachmentAccent, c.surface],
        ['dashboardBlue on bluePale', c.dashboardBlue, c.dashboardBluePale],
      ],
      AA_TEXT
    );
  });

  it('filled controls have readable labels', () => {
    expectContrast(
      [
        ['today', c.todayText, c.todayBg],
        ['retry button', c.retryButtonText, c.retryButtonBg],
        ['primary button', c.primaryButtonText, c.primaryButtonBg],
        ['grades summary', c.gradesSummaryText, c.gradesSummaryBg],
        ['gold tab', c.black, c.gold],
        ['onAccent / plan', c.onAccent, featureAccents.plan],
        ['onAccent / grades', c.onAccent, featureAccents.grades],
        ['onAccent / announcements', c.onAccent, featureAccents.announcements],
      ],
      AA_TEXT
    );
  });

  it('sidebar icons stand out from the menu panel', () => {
    const accents: Pair[] = [
      ['menuDashboardAccent', c.menuDashboardAccent, c.surfaceRaised],
      ['menuSettingsAccent', c.menuSettingsAccent, c.surfaceRaised],
      ...Object.entries(featureAccents).map(
        ([key, color]) => [key, color, c.surfaceRaised] as Pair
      ),
    ];
    expectContrast(accents, AA_GRAPHIC);
  });

  it('lesson type labels are readable on lesson cards', () => {
    expectContrast(
      Object.entries(darkLessonTypeColors).map(
        ([key, color]) => [key, color, c.surface] as Pair
      ),
      AA_TEXT
    );
  });

  it('events panels keep white text readable', () => {
    const pairs: Pair[] = EVENTS_DEPARTMENTS.flatMap((department) =>
      department.panelColor
        ? [
            [
              department.id,
              '#FFFFFF',
              resolveDepartmentPanelColor(department.panelColor, true),
            ] as Pair,
          ]
        : []
    );
    expectContrast(pairs, AA_TEXT);
  });
});

describe('dark grades palette contrast', () => {
  const g = darkGradesColors;

  it('screen text and accent are readable', () => {
    expectContrast(
      [
        ['text', g.text, g.surface],
        ['textMuted', g.textMuted, g.surface],
        ['primary', g.primary, g.surface],
        ['primary on background', g.primary, g.background],
        ['retry label on primary', g.surface, g.primary],
        ['gradeRed text', g.gradeRed, g.surface],
      ],
      AA_TEXT
    );
  });

  it('grade badges are readable', () => {
    expectContrast(
      [
        ['grade 5', g.gradeGreen, g.gradeGreenBg],
        ['grade 4', g.gradeBlue, g.gradeBlueBg],
        ['grade 3', g.gradeYellow, g.gradeYellowBg],
        ['grade 2', g.gradeRed, g.gradeRedBg],
        ['no grade', g.gradeGray, g.gradeGrayBg],
      ],
      AA_TEXT
    );
  });
});
