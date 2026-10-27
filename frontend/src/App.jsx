import { useState } from "react";
import {
  BookOpen,
  Code2,
  SquareCheckBig,
  Award,
  Flame,
  Wand2,
  Brain,
  Route,
} from "lucide-react";
import Roadmap from "./pages/Roadmap.jsx";
import Lessons from "./pages/Lessons.jsx";
import Playground from "./pages/Playground.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import Certificate from "./pages/Certificate.jsx";
import { TRACKS } from "./tracks.js";

const TABS = [
  { id: "roadmap", label: "Roadmap", icon: Route, color: "text-sky-400" },
  {
    id: "lessons",
    label: "Lessons",
    icon: BookOpen,
    color: "text-emerald-400",
  },
  {
    id: "playground",
    label: "Playground",
    icon: Code2,
    color: "text-slate-300",
  },
  {
    id: "quizzes",
    label: "Quizzes",
    icon: SquareCheckBig,
    color: "text-amber-400",
  },
  {
    id: "certificate",
    label: "Certificate",
    icon: Award,
    color: "text-purple-400",
  },
];

export default function App() {
  const [tab, setTab] = useState("roadmap");

  const all = TRACKS.flatMap((t) => t.steps);
  const progress = Math.round(
    (all.filter((s) => s.status === "done").length / all.length) * 100,
  );
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-edge bg-nav px-6 py-3 lg:px-32">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-600">
            <Brain className="size-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">AccessML</h1>
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                QWEN 2.5
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Free ML Powered by Open Weights
            </p>
          </div>
          <div className="ml-2 hidden items-center gap-3 rounded-xl border border-edge px-4 py-2 md:flex">
            <Flame className="size-4 text-orange-400" />
            <span className="text-sm font-semibold text-amber-300">
              5 Day Streak
            </span>
            <span className="h-5 w-px bg-edge" />
            <span className="grid size-8 place-items-center rounded-full bg-purple-500 text-xs font-bold">
              AR
            </span>
          </div>
        </div>

        <nav className="flex gap-1 rounded-xl border border-edge bg-ink/60 p-1">
          {TABS.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === id
                  ? "bg-edge text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`size-4 ${color}`} /> {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="w-40">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress</span>
              <span className="font-semibold text-emerald-400">
                {progress}%
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-edge">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/20">
            <Wand2 className="size-4" /> AI Tutor
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-12">
        {tab === "roadmap" && <Roadmap go={setTab} />}
        {tab === "lessons" && (
          <Lessons
            goQuiz={() => setTab("quizzes")}
            goLab={() => setTab("playground")}
          />
        )}
        {tab === "playground" && <Playground />}
        {tab === "quizzes" && <Quizzes />}
        {tab === "certificate" && <Certificate />}
      </main>
    </div>
  );
}
