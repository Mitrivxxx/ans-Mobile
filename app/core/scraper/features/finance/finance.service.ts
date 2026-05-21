import { fetchStudentFeesPage } from './finance.fetch';
import { parseStudentFees } from './finance.parse';
import type { StudentFee } from './finance.types';

export class FinanceService {
  async getStudentFees(): Promise<StudentFee[]> {
    const html = await fetchStudentFeesPage();
    return parseStudentFees(html);
  }
}

export type { StudentFee, StudentFeeAdditional, PaymentStatusTone } from './finance.types';
