import type { OwedSummary as Summary } from '@/lib/invoices/rules';
import { formatMoney } from '@/lib/invoices/totals';

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** The one number the studio comes here for: what is still owed. */
export function OwedSummary({ summary }: { summary: Summary }) {
  const details = [
    `across ${plural(summary.sentCount, 'sent invoice', 'sent invoices')}`,
    summary.draftCount > 0 ? `${plural(summary.draftCount, 'draft', 'drafts')} not sent yet` : '',
  ].filter(Boolean);

  return (
    <section className="owed" aria-label="Still owed">
      <p className="owed-total">
        <span className="amount">{formatMoney(summary.owedMinor)}</span> still owed
      </p>
      <p className="owed-detail">{details.join(' · ')}</p>
    </section>
  );
}
