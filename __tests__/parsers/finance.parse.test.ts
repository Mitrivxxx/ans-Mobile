import { describe, expect, it } from 'vitest';

import { parseStudentFees } from '../../app/core/scraper/features/finance/finance.parse';
import { authenticatedPage } from '../helpers/authenticatedPage';
import { readFixture } from '../helpers/readFixture';

describe('parseStudentFees', () => {
  it('parsuje wiersze siatki opłat', () => {
    const fees = parseStudentFees(
      authenticatedPage(readFixture('finance-fees.html'))
    );

    expect(fees).toHaveLength(1);
    expect(fees[0]).toMatchObject({
      id: '0',
      description: 'Opłata za studia',
      fieldOfStudy: 'Informatyka',
      dueDate: '2026-03-15',
      paymentStatus: 'Zapłacono',
      paymentStatusTone: 'paid',
      amountDue: '0,00 zł',
      installment: '1/10',
      paymentDate: '2026-03-01',
    });
    expect(fees[0].additional.accruedInterest).toBe('0');
    expect(fees[0].additional.bonus).toBe('0');
  });

  it('pomija wiersze bez DXDataRow', () => {
    const fees = parseStudentFees(
      authenticatedPage('<table id="gridViewOplaty_DXMainTable"></table>')
    );
    expect(fees).toEqual([]);
  });
});
