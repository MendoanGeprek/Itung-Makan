import MoneyInput from './MoneyInput'

export default function BillInputs({ grossTotal, netPaid, onGrossChange, onNetChange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Tagihan
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="gross-total"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Total Sebelum Diskon
          </label>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Angka di struk sebelum promo dipotong — sudah termasuk ongkir dan biaya layanan.
          </p>
          <MoneyInput
            id="gross-total"
            value={grossTotal}
            onChange={onGrossChange}
            className="mt-2"
          />
        </div>

        <div>
          <label
            htmlFor="net-paid"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Total Dibayar
          </label>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Uang yang benar-benar keluar dari rekening setelah semua promo.
          </p>
          <MoneyInput id="net-paid" value={netPaid} onChange={onNetChange} className="mt-2" />
        </div>
      </div>
    </section>
  )
}
