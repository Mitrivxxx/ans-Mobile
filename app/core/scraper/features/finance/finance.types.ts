export type PaymentStatusTone = 'paid' | 'unpaid' | 'unknown';

export interface StudentFeeAdditional {
  accruedInterest: string;
  paidInterest: string;
  bonus: string;
  writeOff: string;
  prescription: string;
  raw: string;
}

export interface StudentFee {
  id: string;
  description: string;
  fieldOfStudy: string;
  dueDate: string;
  paymentStatus: string;
  paymentStatusTone: PaymentStatusTone;
  amountDue: string;
  installment: string;
  paymentDate: string;
  additional: StudentFeeAdditional;
}
