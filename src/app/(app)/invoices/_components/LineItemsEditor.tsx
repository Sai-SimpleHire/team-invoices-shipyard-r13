'use client';

import { Button } from '@/components/ui_foundation/Button';
import { formatMoney, lineAmountMinor, toHundredths, toMinorUnits } from '@/lib/invoices/totals';

import { emptyLine, type DraftInvoice, type DraftLine } from './draft';

type LineField = 'description' | 'quantity' | 'unitPrice';

const LABELS: Record<LineField, string> = {
  description: 'Description',
  quantity: 'Quantity',
  unitPrice: 'Unit price (£)',
};

/** The invoice's lines: what was done, how many, at what price, and the amount it comes to. */
export function LineItemsEditor({
  draft,
  errors,
  onChange,
}: {
  draft: DraftInvoice;
  errors: Record<string, string>;
  onChange: (next: DraftInvoice) => void;
}) {
  const setLine = (key: number, field: LineField, value: string) =>
    onChange({
      ...draft,
      lines: draft.lines.map((line) => (line.key === key ? { ...line, [field]: value } : line)),
    });
  const addLine = () => {
    const nextKey = Math.max(-1, ...draft.lines.map((line) => line.key)) + 1;
    onChange({ ...draft, lines: [...draft.lines, emptyLine(nextKey)] });
  };
  const removeLine = (key: number) =>
    onChange({ ...draft, lines: draft.lines.filter((line) => line.key !== key) });

  return (
    <fieldset className="invoice-lines">
      <legend>Lines</legend>
      {errors.lines ? <p className="field-error">{errors.lines}</p> : null}
      {draft.lines.map((line, index) => (
        <LineRow
          key={line.key}
          line={line}
          index={index}
          errors={errors}
          canRemove={draft.lines.length > 1}
          onSet={setLine}
          onRemove={removeLine}
        />
      ))}
      <div>
        <Button tone="quiet" onClick={addLine}>
          Add a line
        </Button>
      </div>
    </fieldset>
  );
}

function LineRow(props: {
  line: DraftLine;
  index: number;
  errors: Record<string, string>;
  canRemove: boolean;
  onSet: (key: number, field: LineField, value: string) => void;
  onRemove: (key: number) => void;
}) {
  const { line, index, errors } = props;
  const amount = lineAmountMinor({
    quantityHundredths: toHundredths(line.quantity) ?? 0,
    unitPriceMinor: toMinorUnits(line.unitPrice) ?? 0,
  });
  const fields: LineField[] = ['description', 'quantity', 'unitPrice'];

  return (
    <div className="invoice-line" role="group" aria-label={`Line ${index + 1}`}>
      {fields.map((field) => {
        const id = `line-${line.key}-${field}`;
        const error = errors[`lines.${index}.${field}`];
        return (
          <div key={field} className={`form-field invoice-line-${field}`}>
            <label htmlFor={id}>{LABELS[field]}</label>
            <input
              id={id}
              value={line[field]}
              inputMode={field === 'description' ? 'text' : 'decimal'}
              onChange={(event) => props.onSet(line.key, field, event.target.value)}
              {...(error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {})}
            />
            {error ? (
              <p className="field-error" id={`${id}-error`}>
                {error}
              </p>
            ) : null}
          </div>
        );
      })}
      <div className="invoice-line-amount">
        <span className="field-hint">Amount</span>
        <span className="amount">{formatMoney(amount)}</span>
      </div>
      {props.canRemove ? (
        <Button tone="quiet" onClick={() => props.onRemove(line.key)}>
          Remove <span className="ui-visually-hidden">line {index + 1}</span>
        </Button>
      ) : null}
    </div>
  );
}
