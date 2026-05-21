import { parseHTML } from 'linkedom';

import { assertAuthenticatedHtml } from '../../auth/sessionValidation';
import type {
  PaymentStatusTone,
  StudentFee,
  StudentFeeAdditional,
} from './finance.types';

export type { StudentFee, StudentFeeAdditional, PaymentStatusTone } from './finance.types';

const GRID_ROW_PREFIX = 'gridViewOplaty_DXDataRow';

const ADDITIONAL_LABELS: ReadonlyArray<
  [keyof Omit<StudentFeeAdditional, 'raw'>, string]
> = [
  ['accruedInterest', 'odsetki naliczone'],
  ['paidInterest', 'odsetki zapłacone'],
  ['bonus', 'bonifikata'],
  ['writeOff', 'umorzenie'],
  ['prescription', 'przedawnienie'],
];

function cellText(td: Element): string {
  return (td.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRowCells(row: Element): Element[] {
  return Array.from(row.children).filter(
    (node): node is Element => node.tagName === 'TD'
  );
}

function getDataCells(row: Element): Element[] {
  const tds = getRowCells(row);
  let end = tds.length;

  const lastClass = tds[end - 1]?.getAttribute('class') ?? '';
  if (lastClass.includes('dxgvAIC')) {
    end -= 1;
  }

  return tds.slice(0, end);
}

function isDataRowId(id: string): boolean {
  return new RegExp(`${GRID_ROW_PREFIX}\\d+$`, 'i').test(id);
}

function rowIdToFeeId(rowId: string): string {
  const match = rowId.match(/DXDataRow(\d+)$/i);
  return match?.[1] ?? rowId;
}

function paymentStatusFromCell(td: Element): {
  text: string;
  tone: PaymentStatusTone;
} {
  const span = td.querySelector('span');
  const text = (span?.textContent ?? td.textContent ?? '').trim();
  const cls = span?.getAttribute('class') ?? '';

  let tone: PaymentStatusTone = 'unknown';
  if (cls.includes('wd-color-green')) {
    tone = 'paid';
  } else if (cls.includes('wd-color-red')) {
    tone = 'unpaid';
  }

  return { text, tone };
}

function parseAdditional(cellText: string): StudentFeeAdditional {
  const text = cellText.replace(/\s+/g, ' ').trim();
  const additional: StudentFeeAdditional = {
    accruedInterest: '',
    paidInterest: '',
    bonus: '',
    writeOff: '',
    prescription: '',
    raw: text,
  };

  for (let i = 0; i < ADDITIONAL_LABELS.length; i++) {
    const [key, label] = ADDITIONAL_LABELS[i];
    const start = text.toLowerCase().indexOf(label.toLowerCase());
    if (start < 0) {
      continue;
    }

    const valueStart = start + label.length;
    let valueEnd = text.length;

    for (let j = i + 1; j < ADDITIONAL_LABELS.length; j++) {
      const nextLabel = ADDITIONAL_LABELS[j][1];
      const nextIdx = text
        .toLowerCase()
        .indexOf(nextLabel.toLowerCase(), valueStart);
      if (nextIdx >= 0 && nextIdx < valueEnd) {
        valueEnd = nextIdx;
      }
    }

    additional[key] = text.slice(valueStart, valueEnd).trim();
  }

  return additional;
}

export function parseStudentFees(html: string): StudentFee[] {
  assertAuthenticatedHtml(html, 'Sesja wygasła — nie można pobrać opłat.');
  const { document } = parseHTML(html);
  const fees: StudentFee[] = [];

  const rows = document.querySelectorAll(
    '#gridViewOplaty_DXMainTable tr[id], tr[id*="gridViewOplaty"]'
  );

  rows.forEach((row) => {
    const rowId = row.getAttribute('id') ?? '';
    if (!isDataRowId(rowId)) {
      return;
    }

    const cells = getDataCells(row);
    if (cells.length < 7) {
      return;
    }

    const { text: paymentStatus, tone: paymentStatusTone } =
      paymentStatusFromCell(cells[3] ?? ({} as Element));

    fees.push({
      id: rowIdToFeeId(rowId),
      description: cellText(cells[0] ?? ({} as Element)),
      fieldOfStudy: cellText(cells[1] ?? ({} as Element)),
      dueDate: cellText(cells[2] ?? ({} as Element)),
      paymentStatus,
      paymentStatusTone,
      amountDue: cellText(cells[4] ?? ({} as Element)),
      installment: cellText(cells[5] ?? ({} as Element)),
      paymentDate: cellText(cells[6] ?? ({} as Element)),
      additional: parseAdditional(cellText(cells[7] ?? ({} as Element))),
    });
  });

  return fees;
}
