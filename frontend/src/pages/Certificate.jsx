import { useMemo, useState } from 'react'
import { SlidersHorizontal, Printer, Award } from 'lucide-react'

export default function Certificate() {
  const [name, setName] = useState('Alex Rivera')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const code = useMemo(() => `ML-${Math.floor(1000 + Math.random() * 9000)}-${date.slice(0, 4)}`, [date])

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[350px_1fr] xl:px-12">
      <section className="rounded-2xl border border-edge bg-panel p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold"><SlidersHorizontal className="size-4 text-emerald-400" /> Certificate Details</h2>
        <p className="mt-1 border-b border-edge pb-4 text-sm text-slate-400">Customize your verified certificate of completion.</p>

        <label className="mt-5 block text-sm font-semibold">Student Full Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-edge bg-ink px-4 py-3 text-sm outline-none focus:border-emerald-500" />
        </label>
        <label className="mt-5 block text-sm font-semibold">Completion Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-xl border border-edge bg-ink px-4 py-3 text-sm outline-none [color-scheme:dark] focus:border-emerald-500" />
        </label>
        <label className="mt-5 block text-sm font-semibold">Verification Hash Code
          <input readOnly value={code} className="mt-2 w-full rounded-xl border border-edge bg-ink px-4 py-3 font-mono text-sm text-slate-500" />
        </label>
        <button onClick={() => window.print()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-ink hover:bg-emerald-400">
          <Printer className="size-4" /> Print / Save PDF Certificate
        </button>
      </section>

      <section id="certificate" className="rounded-2xl border-4 border-amber-700 bg-gradient-to-br from-ink via-nav to-ink p-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold">AccessML</p>
            <p className="text-[11px] tracking-[0.2em] text-slate-400">OPEN WEIGHT LEARNING HUB</p>
          </div>
          <span className="grid size-16 place-items-center rounded-full bg-amber-400"><Award className="size-8 text-ink" /></span>
        </div>
        <div className="mt-12 text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-amber-400">CERTIFICATE OF COMPLETION</p>
          <h3 className="mt-3 font-serif text-5xl font-bold uppercase">{name || 'Your Name'}</h3>
          <p className="mt-4 text-sm text-slate-300">has successfully completed all hands-on code labs and assessments for</p>
          <p className="mt-3 text-lg font-bold tracking-wide text-emerald-400">SUPERVISED MACHINE LEARNING &amp; PYTHON FOUNDATIONS</p>
        </div>
        <div className="mt-10 flex items-end justify-between border-t border-edge pt-5">
          <div><p className="text-[11px] tracking-widest text-slate-400">ISSUE DATE</p><p className="font-semibold">{date}</p></div>
          <div className="text-right"><p className="text-[11px] tracking-widest text-slate-400">VERIFICATION ID</p><p className="font-mono text-xs text-slate-400">{code}</p></div>
        </div>
      </section>
    </div>
  )
}
