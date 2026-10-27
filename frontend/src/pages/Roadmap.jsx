import { useState } from 'react'
import { Terminal, Grid3x3, Table2, BarChart3, ListChecks, Tags, TrendingUp, TrendingDown, Split, Gauge, Award, Network, Waypoints, Layers, AudioLines, Rocket, Check } from 'lucide-react'
import { TRACKS } from '../tracks.js'

const ICONS = { Terminal, Grid3x3, Table2, BarChart3, ListChecks, Tags, TrendingUp, TrendingDown, Split, Gauge, Award, Network, Waypoints, Layers, AudioLines, Rocket }
const OFFSETS = [-50, 0, 50, 0]      // zigzag: up, middle, down, middle
const COL = 140, LEFT = 90, SIZE = 88, H = 380
const STYLE = {
  done:    { face: '#5c8f35', edge: '#3b6122', icon: 'rgba(12,30,6,.5)',    label: 'Completed' },
  current: { face: '#a8dc5f', edge: '#78a83a', icon: '#ffffff',             label: 'Up next' },
  todo:    { face: '#3b3e37', edge: '#2a2c27', icon: 'rgba(255,255,255,.28)', label: 'Locked until you finish earlier stops' },
}
const diamond = { transform: 'translate(-50%,-50%) scaleY(.58) rotate(45deg)', width: SIZE, height: SIZE }

export default function Roadmap({ go }) {
  const [trackId, setTrackId] = useState('supervised')
  const track = TRACKS.find((t) => t.id === trackId)
  const done = track.steps.filter((s) => s.status === 'done').length

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Learning roadmap</h2>
          <p className="text-sm text-slate-400">{done} of {track.steps.length} lessons complete. Hover a tile to see the lesson. Scroll sideways for later lessons.</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-edge bg-panel p-1" role="tablist">
          {TRACKS.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === trackId} onClick={() => setTrackId(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${t.id === trackId ? 'bg-edge text-white' : 'text-slate-400 hover:text-white'}`}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl  px-4 py-6">
        <div className="relative" style={{ width: track.steps.length * COL + LEFT, height: H }}>
          {/* floor tiles sit behind every lesson tile */}
          {track.steps.map((_, i) => (
            <div key={i} className="absolute rounded-[28px] bg-[#272823]"
              style={{ left: LEFT + i * COL, top: `calc(50% + ${OFFSETS[i % 4] + 14}px)`, width: 150, height: 150, transform: 'translate(-50%,-50%) scaleY(.58) rotate(45deg)' }} />
          ))}

          {track.steps.map((s, i) => {
            const Icon = ICONS[s.icon]
            const c = STYLE[s.status]
            const off = OFFSETS[i % 4]
            const tipAbove = off > 0
            return (
              <button key={s.title} onClick={() => go(s.go)} aria-label={`${s.title}. ${c.label}.`}
                className="group absolute z-10 outline-none hover:z-30 focus-visible:z-30"
                style={{ left: LEFT + i * COL, top: `calc(50% + ${off + 14}px)`, width: SIZE * 1.42, height: 70, transform: 'translate(-50%,-50%)' }}>
                <span className="absolute inset-0 block transition-transform duration-150 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
                  <span className="absolute left-1/2 top-1/2 block rounded-[18px]" style={{ ...diamond, background: c.edge, marginTop: 11 }} />
                  <span className={`absolute left-1/2 top-1/2 block rounded-[18px] ${s.status === 'current' ? 'animate-pulse' : ''}`} style={{ ...diamond, background: c.face }} />
                  <Icon className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-[58%]" style={{ color: c.icon }} strokeWidth={1.8} />
                  {s.status === 'done' && (
                    <span className="absolute right-3 top-0 grid size-5 place-items-center rounded-full bg-lime-300 text-[#2d4a17]"><Check className="size-3.5" strokeWidth={3} /></span>
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
