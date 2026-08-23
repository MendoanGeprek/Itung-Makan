import MoneyInput from './MoneyInput'
import { SectionTitle } from './receipt'

function Field({ id, label, hint, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="text-ink block text-sm font-bold">
        {label}
      </label>
      <p className="text-faint mt-0.5 text-[11px] leading-relaxed">{hint}</p>
      <MoneyInput id={id} value={value} onChange={onChange} className="mt-2" />
    </div>
  )
}

export default function BillInputs({ grossTotal, netPaid, onGrossChange, onNetChange }) {
  return (
    <section>
      <SectionTitle>Tagihan</SectionTitle>

      <div className="grid gap-4 pb-4">
        <Field
          id="gross-total"
          label="Total Sebelum Diskon"
          hint="Angka di struk sebelum promo dipotong, sudah termasuk ongkir dan biaya layanan."
          value={grossTotal}
          onChange={onGrossChange}
        />
        <Field
          id="net-paid"
          label="Total Setelah Diskon"
          hint="Uang yang benar-benar keluar dari rekening setelah semua promo."
          value={netPaid}
          onChange={onNetChange}
        />
      </div>
    </section>
  )
}
