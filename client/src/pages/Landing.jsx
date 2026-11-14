import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { SectionTitle } from '../components/ui';

const SKILLS = ['JavaScript', 'Python', 'UI Design', 'Guitar', 'Photography', 'Public Speaking', 'Machine Learning', 'Video Editing', 'Data Structures', 'English Writing', 'Graphic Design', 'Cooking'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-3xl" />
          <div className="absolute right-[-10rem] top-40 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="absolute left-[-8rem] top-64 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Peer-to-peer learning · no money, just knowledge
            </div>
            <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-white lg:text-6xl">
              I know <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">X</span>,
              you know <span className="bg-gradient-to-r from-amber-300 to-fuchsia-400 bg-clip-text text-transparent">Y</span>.
              <br />Let's swap.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-400">
              SkillSwap finds the student who wants to learn what you can teach —{' '}
              <span className="text-slate-200">and</span> can teach what you want to learn.
              Request, schedule, meet, rate — and earn Skill Credits along the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3.5 font-bold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-[1.02]">
                Find my match →
              </Link>
              <a href="#matching" className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
                See how matching works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {[
                ['100-pt', 'rule-based match score'],
                ['1 credit', 'earned per teaching session'],
                ['★ 5-star', 'ratings + mentor badges'],
              ].map(([a, b]) => (
                <div key={a} className="flex items-center gap-2">
                  <span className="font-extrabold text-white">{a}</span>
                  <span className="text-slate-500">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Match preview card */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">Your top match</p>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-extrabold text-emerald-300">100% · Perfect swap</span>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="rounded-2xl bg-slate-900/70 p-4 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-black text-white">R</div>
                  <p className="mt-2 text-sm font-bold text-white">You</p>
                  <p className="mt-1 text-xs text-emerald-300">Teach: JavaScript</p>
                  <p className="text-xs text-sky-300">Learn: UI Design</p>
                </div>
                <div className="text-2xl font-black text-fuchsia-400">⇄</div>
                <div className="rounded-2xl bg-slate-900/70 p-4 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 font-black text-white">N</div>
                  <p className="mt-2 text-sm font-bold text-white">Nusrat</p>
                  <p className="mt-1 text-xs text-emerald-300">Teach: UI Design</p>
                  <p className="text-xs text-sky-300">Learn: JavaScript</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  ['40', 'You → them'],
                  ['40', 'Them → you'],
                  ['10', 'Level fit'],
                  ['10', 'Time + mode'],
                ].map(([pts, label]) => (
                  <div key={label} className="rounded-xl bg-white/5 px-2 py-2.5">
                    <p className="text-base font-black text-white">+{pts}</p>
                    <p className="text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-extrabold text-slate-900 transition hover:bg-slate-200">
                Send swap request · costs 0 credits for perfect matches
              </button>
            </div>
          </div>
        </div>

        {/* skill marquee */}
        <div className="relative border-y border-white/10 bg-white/[0.02] py-4">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-4">
            {SKILLS.map((s) => (
              <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                {s}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* HOW */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20">
        <SectionTitle kicker="How it works" title="From “I wish I knew…” to a scheduled session" sub="Four steps. No tutors, no fees — just students teaching students." />
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            ['①', 'List your skills', 'Add what you can teach and what you want to learn, with Beginner / Intermediate / Advanced levels.'],
            ['②', 'Get matched', 'Our rule-based engine scores every student out of 100 and ranks your best partners.'],
            ['③', 'Request & schedule', 'Send a swap request. Once accepted, pick a date, time and Online / Offline mode.'],
            ['④', 'Meet, rate, earn', 'Complete the session, rate each other ★1–5, and the teacher earns +1 Skill Credit.'],
          ].map(([n, t, d]) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-indigo-400/30 hover:bg-white/[0.05]">
              <p className="text-2xl">{n}</p>
              <h3 className="mt-3 font-extrabold text-white">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MATCHING */}
      <section id="matching" className="border-y border-white/10 bg-gradient-to-b from-indigo-950/40 to-slate-950 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="The technical core" title="A matching algorithm you can explain in 30 seconds" sub="Implemented on the backend — dynamic, deterministic, and demo-friendly." />
          <div className="mx-auto mt-12 grid max-w-4xl gap-3">
            {[
              ['40 pts', 'You can teach what they want to learn', 'Compares your teachSkills ∩ their learnSkills', 'emerald'],
              ['40 pts', 'They can teach what you want to learn', 'Compares their teachSkills ∩ your learnSkills', 'sky'],
              ['10 pts', 'Compatible skill levels', 'Teacher level ≥ learner level (or within one step)', 'amber'],
              ['10 pts', 'Compatible availability & mode', 'Flexible matches anything; Both matches Online/Offline', 'fuchsia'],
            ].map(([pts, t, d]) => (
              <div key={t} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4">
                <span className="w-16 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 py-2 text-center text-sm font-black text-white">{pts}</span>
                <div>
                  <p className="font-bold text-white">{t}</p>
                  <p className="text-sm text-slate-500">{d}</p>
                </div>
              </div>
            ))}
            <p className="mt-2 text-center text-sm text-slate-500">100 = perfect two-way swap · 40–80 = one-way + credit eligible · &lt;40 = not shown</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20">
        <SectionTitle kicker="Everything in scope" title="A complete SE project, not a listing site" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['🔐', 'JWT auth + roles', 'Student and Admin roles, bcrypt-hashed passwords, protected routes.'],
            ['🎯', 'Skill profiles', 'Admin-managed skill list keeps names consistent — no duplicates.'],
            ['🔁', 'Swap requests', 'Pending → Accepted / Rejected / Cancelled. Nothing happens without consent.'],
            ['📅', 'Sessions', 'Scheduled → Completed / Cancelled with date, time, duration and mode.'],
            ['⭐', 'Ratings & badges', 'Average rating plus Helpful Mentor, Active Learner, Reliable Partner.'],
            ['✦', 'Skill Credits', 'Teach to earn, spend to learn. Balances can never go negative.'],
            ['🛡️', 'Reports', 'Report misuse; admins review, resolve, suspend if needed.'],
            ['📊', 'Admin dashboard', 'Users, skills, requests, sessions, reports — one control room.'],
            ['🧪', 'Documented API', 'REST + Postman-testable, MongoDB with in-memory fallback for demos.'],
          ].map(([e, t, d]) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-2xl">{e}</p>
              <h3 className="mt-3 font-extrabold text-white">{t}</h3>
              <p className="mt-2 text-sm text-slate-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CREDITS */}
      <section id="credits" className="mx-auto max-w-7xl px-4 pb-20">
        <div className="overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-500/15 via-fuchsia-500/10 to-indigo-500/15 p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">Skill Credit economy</p>
              <h2 className="mt-2 text-3xl font-black text-white">Not every match is perfect. Credits fix that.</h2>
              <p className="mt-4 text-slate-300">Teach any session → earn <b>+1 credit</b>. Request a one-way lesson → spend <b>1 credit</b>. New students start with 2 free credits.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['+1', 'per session taught'], ['2', 'free on signup'], ['0', 'minimum — never negative']].map(([a, b]) => (
                <div key={b} className="rounded-2xl bg-slate-950/60 p-5">
                  <p className="text-3xl font-black text-amber-300">{a}</p>
                  <p className="mt-1 text-xs text-slate-400">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 text-center">
        <h2 className="text-4xl font-black tracking-tight text-white">Someone on campus knows<br />exactly what you want to learn.</h2>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="rounded-xl bg-white px-8 py-3.5 font-extrabold text-slate-900 transition hover:bg-slate-200">Create free account</Link>
          <Link to="/login" className="rounded-xl border border-white/15 px-8 py-3.5 font-bold text-white transition hover:bg-white/10">Log in</Link>
        </div>
        <p className="mt-6 text-xs text-slate-600">Demo: admin@skillswap.local / admin123 · rahim@student.local / student123 · Team CodeXchange</p>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-600">
        SkillSwap · Software Engineering Lab · MERN · Matching + Requests + Sessions + Reviews + Credits + Admin
      </footer>
    </div>
  );
}
