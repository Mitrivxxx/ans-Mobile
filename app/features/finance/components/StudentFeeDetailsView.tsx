import React from 'react';
import { Text, View } from 'react-native';

import ScreenBackButton from '../../../components/ScreenBackButton';
import type { StudentFee } from '../../../core/scraper/features/finance/finance.types';
import {
  createFinanceUiStyles,
  paymentStatusStyle,
} from '../financeUi.styles';

type FinanceUiStyles = ReturnType<typeof createFinanceUiStyles>;

type Props = {
  fee: StudentFee;
  styles: FinanceUiStyles;
  onBack: () => void;
};

function DetailRow({
  label,
  value,
  styles,
  valueStyle,
}: {
  label: string;
  value: string;
  styles: FinanceUiStyles;
  valueStyle?: object;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, valueStyle]} numberOfLines={3}>
        {value || '—'}
      </Text>
    </View>
  );
}

export default function StudentFeeDetailsView({
  fee,
  styles,
  onBack,
}: Props) {
  const statusStyle = paymentStatusStyle(styles, fee.paymentStatusTone);

  return (
    <View>
      <ScreenBackButton label="← Lista opłat" onPress={onBack} />

      <View style={styles.detailsCard}>
        <DetailRow label="Opis" value={fee.description} styles={styles} />
        <DetailRow
          label="Nazwa kierunku"
          value={fee.fieldOfStudy}
          styles={styles}
        />
        <DetailRow label="Termin" value={fee.dueDate} styles={styles} />
        <DetailRow
          label="Stan opłaty"
          value={fee.paymentStatus}
          styles={styles}
          valueStyle={statusStyle}
        />
        <DetailRow label="Kwota stanu" value={fee.amountDue} styles={styles} />
        <DetailRow label="Rata" value={fee.installment} styles={styles} />
        <DetailRow
          label="Data zapłaty"
          value={fee.paymentDate}
          styles={styles}
        />

        <Text style={styles.detailsSectionTitle}>Dodatkowe</Text>
        <DetailRow
          label="Odsetki naliczone"
          value={fee.additional.accruedInterest}
          styles={styles}
        />
        <DetailRow
          label="Odsetki zapłacone"
          value={fee.additional.paidInterest}
          styles={styles}
        />
        <DetailRow label="Bonifikata" value={fee.additional.bonus} styles={styles} />
        <DetailRow label="Umorzenie" value={fee.additional.writeOff} styles={styles} />
        <DetailRow
          label="Przedawnienie"
          value={fee.additional.prescription}
          styles={styles}
        />
      </View>
    </View>
  );
}
