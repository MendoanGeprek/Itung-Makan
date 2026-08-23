/**
 * Elemen dasar struk. Dikumpulkan di satu berkas supaya tampilan garis,
 * titik penyambung, dan judul bagian konsisten di seluruh halaman.
 */

/** Garis putus-putus pemisah bagian. */
export const Rule = ({ className = '' }) => (
  <div className={`rule-dashed ${className}`} aria-hidden="true" />
)

/** Garis ganda, dipakai sebelum baris total seperti di struk kasir. */
export const DoubleRule = ({ className = '' }) => (
  <div className={`rule-double ${className}`} aria-hidden="true" />
)

/** Judul bagian: huruf besar, spasi lebar, rata tengah. */
export const SectionTitle = ({ children }) => (
  <h2 className="text-faint py-3 text-center text-[11px] font-semibold tracking-[0.35em] uppercase">
    {children}
  </h2>
)

/**
 * Baris "nama .......... nominal". Titik-titiknya elemen tersendiri yang
 * memanjang mengisi ruang sisa, jadi nominal selalu rata kanan berapa pun
 * panjang namanya.
 */
export const LeaderLine = ({ label, value, bold = false, muted = false, className = '' }) => (
  <div className={`flex items-baseline gap-1.5 ${className}`}>
    <span className={`shrink-0 truncate ${muted ? 'text-faint' : ''} ${bold ? 'font-bold' : ''}`}>
      {label}
    </span>
    <span className="leader" aria-hidden="true" />
    <span
      className={`shrink-0 tabular-nums ${muted ? 'text-faint' : ''} ${bold ? 'font-bold' : 'font-medium'}`}
    >
      {value}
    </span>
  </div>
)
