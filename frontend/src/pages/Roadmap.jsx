import { useEffect, useRef } from 'react'
import { TRACKS } from '../tracks.js'
import { Terminal, Grid3x3, Table2, BarChart3, ListChecks, Tags, TrendingUp, TrendingDown, Split, Gauge, Award, Network, Waypoints, Layers, AudioLines, Rocket, BrainCircuit, FileSearch, Cpu, ServerCog, Check, ChevronLeft, ChevronRight } from 'lucide-react'

const ICONS = { Terminal, Grid3x3, Table2, BarChart3, ListChecks, Tags, TrendingUp, TrendingDown, Split, Gauge, Award, Network, Waypoints, Layers, AudioLines, Rocket, BrainCircuit, FileSearch, Cpu, ServerCog }
const OFFSETS = [-50, 0, 50, 0]      // zigzag: up, middle, down, middle
const COL = 140, LEFT = 90, SIZE = 88, H = 420, TRACK_GAP = 3   // gap between tracks, in columns
const FLOORS = ['#222a33', '#2b2a22', '#2a2231']                // floor tint per track
const STYLE = {
  done:    { face: '#5c8f35', edge: '#3b6122', icon: 'rgba(12,30,6,.5)',      label: 'Completed' },
  current: { face: '#464841', edge: '#2f312c', icon: 'rgba(255,255,255,.55)', label: 'Next lesson' },
  todo:    { face: '#3b3e37', edge: '#2a2c27', icon: 'rgba(255,255,255,.28)', label: 'Locked until you finish earlier stops' },
}
const diamond = { transform: 'translate(-50%,-50%) scaleY(.58) rotate(45deg)', width: SIZE, height: SIZE }
const floorTile = { width: 150, height: 150, transform: 'translate(-50%,-50%) scaleY(.58) rotate(45deg)' }

// Lay every track end to end on one long strip, with a divider gap between tracks
let col = 0
const labels = [], items = [], dividers = []
TRACKS.forEach((t, ti) => {
  const done = t.steps.filter((s) => s.status === 'done').length
  const startCol = col
  t.steps.forEach((s, si) => items.push({ ...s, key: `${t.id}-${si}`, x: LEFT + col++ * COL, off: OFFSETS[si % 4], floor: FLOORS[ti % 3] }))
  labels.push({ id: t.id, name: t.name, n: ti + 1, x: LEFT + startCol * COL, done, total: t.steps.length })
  if (ti < TRACKS.length - 1) {
    const next = TRACKS[ti + 1]
    dividers.push({
      id: `${t.id}-divider`,
      name: next.name,
      done: next.steps.filter((s) => s.status === 'done').length,
      total: next.steps.length,
      tint: FLOORS[(ti + 1) % 3],
      x: LEFT + (col + (TRACK_GAP - 1) / 2) * COL,
      tiles: Array.from({ length: TRACK_GAP }, (_, k) => LEFT + (col + k) * COL),
    })
    col += TRACK_GAP
  }
})
const WIDTH = LEFT + (col + 0.5) * COL
const totalDone = labels.reduce((a, l) => a + l.done, 0)
const total = items.length

const rowTop = (off) => `calc(50% + ${off + 14}px)`

export default function Roadmap({ go, setProgress }) {
  
  const scroller = useRef(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })

  const jump = (x) => scroller.current?.scrollTo({ left: Math.max(0, x - 70), behavior: 'smooth' })
  const nudge = (dir) => scroller.current?.scrollBy({ left: dir * 520, behavior: 'smooth' })

  useEffect(() => {
    const el = scroller.current
    // open on the next lesson
    const cur = items.find((s) => s.status === 'current')
    if (cur) el.scrollLeft = cur.x - el.clientWidth / 2
    // mouse wheel scrolls sideways (lets the page scroll again once you hit either end)
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0
      if (atStart || atEnd) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Learning roadmap</h2>
          <p className="text-sm text-slate-400">{totalDone} of {total} lessons complete. Drag or scroll sideways to move between tracks, and hover a tile to see the lesson.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-edge bg-panel p-1">
          <button onClick={() => nudge(-1)} aria-label="Scroll left" className="rounded-lg p-1.5 text-slate-400 hover:text-white"><ChevronLeft className="size-4" /></button>
          {labels.map((l) => (
            <button key={l.id} onClick={() => jump(l.x)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-edge hover:text-white">{l.name}</button>
          ))}
          <button onClick={() => nudge(1)} aria-label="Scroll right" className="rounded-lg p-1.5 text-slate-400 hover:text-white"><ChevronRight className="size-4" /></button>
        </div>
      </div>

      <div
        ref={scroller}
        onMouseDown={(e) => {
          if (e.button !== 0) return
          drag.current = { down: true, x: e.clientX, left: scroller.current.scrollLeft, moved: false }
        }}
        onMouseMove={(e) => {
          const d = drag.current
          if (!d.down) return
          const dx = e.clientX - d.x
          if (Math.abs(dx) > 5) d.moved = true
          if (d.moved) scroller.current.scrollLeft = d.left - dx
        }}
        onMouseUp={() => { drag.current.down = false }}
        onMouseLeave={() => { drag.current.down = false }}
        onClickCapture={(e) => {
          if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false }
        }}
        className="cursor-grab select-none overflow-x-auto overflow-y-hidden rounded-3xl px-4 pb-4 pt-6 active:cursor-grabbing
          [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5
          [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/70
          supports-[-moz-appearance:none]:[scrollbar-width:thin] supports-[-moz-appearance:none]:[scrollbar-color:#10b98166_transparent]"
      >
        <div className="relative" style={{ width: WIDTH, height: H }}>
          {/* heading for the first track */}
          <div className="absolute top-0" style={{ left: labels[0].x - 60 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Start here</p>
            <p className="text-lg font-bold">{labels[0].name}</p>
            <p className="text-xs text-slate-400">{labels[0].done} of {labels[0].total} complete</p>
          </div>

          {/* "Next section" dividers between tracks */}
          {dividers.map((d) => (
            <div key={d.id} className="pointer-events-none">
              {d.tiles.map((x) => (
                <div key={x} className="absolute rounded-[28px] opacity-60" style={{ ...floorTile, left: x, top: rowTop(0), background: d.tint }} />
              ))}
              <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: d.x, top: rowTop(0) }}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Next section</p>
                <p className="mt-1 whitespace-nowrap text-3xl font-extrabold">{d.name}</p>
                <p className="mt-1 text-xs text-slate-400">{d.done} of {d.total} complete</p>
              </div>
            </div>
          ))}

          {/* floor tiles sit behind every lesson tile */}
          {items.map((s) => (
            <div key={s.key} className="absolute rounded-[28px]" style={{ ...floorTile, left: s.x, top: rowTop(s.off), background: s.floor }} />
          ))}

          {items.map((s) => {
            const Icon = ICONS[s.icon]
            const c = STYLE[s.status]
            const tipAbove = s.off > 0
            return (
              <button key={s.key} onClick={() => go(s.go)} aria-label={`${s.title}. ${c.label}.`}
                className="group absolute z-10 outline-none hover:z-30 focus-visible:z-30"
                style={{ left: s.x, top: rowTop(s.off), width: SIZE * 1.42, height: 70, transform: 'translate(-50%,-50%)' }}>
                <span className="absolute inset-0 block transition-transform duration-150 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
                  <span className="absolute left-1/2 top-1/2 block rounded-[18px]" style={{ ...diamond, background: c.edge, marginTop: 11 }} />
                  <span className="absolute left-1/2 top-1/2 block rounded-[18px]" style={{ ...diamond, background: c.face }} />
                  <Icon className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-[58%]" style={{ color: c.icon }} strokeWidth={1.8} />
                  {s.status === 'done' && (
                    <span className="absolute right-3 top-0 grid size-5 place-items-center rounded-full bg-lime-300 text-[#2d4a17]"><Check className="size-3.5" strokeWidth={3} /></span>
                  )}
                  {s.status === 'current' && (
                    <>
                      <span className="absolute right-4 top-1 size-3 animate-pulse rounded-full bg-lime-300" />
                      {/* always-visible "Next" pill, hides while the hover bubble is open */}
                      <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-lg bg-white px-3 py-1 text-sm font-extrabold text-[#1f201c] shadow-lg transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0 after:absolute after:left-1/2 after:top-full after:size-2.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-white after:content-['']">
                        Next
                      </span>
                    </>
                  )}
                </span>
                <span role="tooltip"
                  className={`pointer-events-none absolute left-1/2 w-56 -translate-x-1/2 rounded-xl bg-white px-4 py-3 text-left text-[#1f201c] opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${tipAbove ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                  <span className="block text-sm font-bold">{s.title}</span>
                  <span className="mt-0.5 block text-sm leading-snug">{s.text}</span>
                  <span className="mt-1.5 block text-xs font-semibold text-emerald-700">{c.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}