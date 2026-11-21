import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { SectionTitle, SwapMark } from '../components/ui';

const SKILLS = ['JavaScript', 'Python', 'UI Design', 'Guitar', 'Photography', 'Public Speaking', 'Machine Learning', 'Video Editing', 'Data Structures', 'English Writing', 'Graphic Design', 'Cooking'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <Navbar />

      {/* HERO — asymmetric split, match preview as the product moment */}
      <header className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-ink-2">
              <SwapMark className="h-4 w-4" />
              Peer-to-peer learning — no money, just knowledge
            </p>
            <h1 className="font-display mt-6 text-5xl font-medium leading-[1.05] tracking-tight text-ink lg:text-6xl">
              I know <span className="text-accent">X</span>, you know{' '}
              <span className="text-accent">Y</span>.
              <br />
              Let&apos;s swap.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              SkillSwap finds the student who wants to learn what you can teach —{' '}
              <span className="text-ink">and</span> can teach what you want to learn.
              Request, schedule, meet, rate — and earn Skill Credits along the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-primary">
                Find my match
              </Link>
              <a href="#matching" className="btn btn-secondary">
                See how matching works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-sm">
              {[
                ['100-pt', 'rule-based match score'],
                ['1 credit', 'earned per teaching session'],
                ['5-star', 'ratings + mentor badges'],
              ].map(([a, b]) => (
                <div key={a} className="flex items-baseline gap-2">
                  <span className="mono font-medium text-ink">{a}</span>
                  <span className="text-ink-3">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Match preview card — the moment: two students, the swap between them */}
          <div className="relative">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Your top match</p>
                <span className="mono text-sm font-medium text-positive">100% · perfect swap</span>
              </div>
              <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="rounded-xl border border-hairline bg-raised p-5 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 font-medium text-accent-deep">R</div>
                  <p className="mt-3 text-sm font-medium text-ink">You</p>
                  <p className="mono mt-1 text-xs text-positive">Teach · JavaScript</p>
                  <p className="mono text-xs text-sky-700">Learn · UI Design</p>
                </div>
                <SwapMark className="h-6 w-6 text-accent" />
                <div className="rounded-xl border border-hairline bg-raised p-5 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 font-medium text-accent-deep">N</div>
                  <p className="mt-3 text-sm font-medium text-ink">Nusrat</p>
                  <p className="mono mt-1 text-xs text-positive">Teach · UI Design</p>
                  <p className="mono text-xs text-sky-700">Learn · JavaScript</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-4 gap-2 text-center">
                {[
                  ['40', 'You → them'],
                  ['40', 'Them → you'],
                  ['10', 'Level fit'],
                  ['10', 'Time + mode'],
                ].map(([pts, label]) => (
                  <div key={label} className="rounded-lg bg-raised px-2 py-3">
                    <p className="mono text-base font-medium text-ink">+{pts}</p>
                    <p className="mt-0.5 text-xs text-ink-3">{label}</p>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary mt-6 w-full">
                Send swap request · free for perfect matches
              </button>
            </div>
          </div>
        </div>

        {/* skill chips — quiet, no glow */}
        <div className="border-y border-hairline bg-surface py-4">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-6">
            {SKILLS.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
        </div>
      </header>

      {/* HOW */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle kicker="How it works" title={'From \u201cI wish I knew\u2026\u201d to a scheduled session'} sub="Four steps. No tutors, no fees — just students teaching students." />
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            ['01', 'List your skills', 'Add what you can teach and what you want to learn, with Beginner / Intermediate / Advanced levels.'],
            ['02', 'Get matched', 'Our rule-based engine scores every student out of 100 and ranks your best partners.'],
            ['03', 'Request & schedule', 'Send a swap request. Once accepted, pick a date, time and Online / Offline mode.'],
            ['04', 'Meet, rate, earn', 'Complete the session, rate each other 1\u20135, and the teacher earns +1 Skill Credit.'],
          ].map(([n, t, d]) => (
            <div key={t} className="card p-6">
              <p className="mono text-sm font-medium text-accent-deep">{n}</p>
              <h3 className="mt-3 text-lg font-medium text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MATCHING — the technical core */}
      <section id="matching" className="border-y border-hairline bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle kicker="The technical core" title="A matching algorithm you can explain in 30 seconds" sub="Implemented on the backend — dynamic, deterministic, and demo-friendly." />
          <div className="mx-auto mt-12 grid max-w-4xl gap-3">
            {[
              ['40 pts', 'You can teach what they want to learn', 'Compares your teach skills against their learn skills'],
              ['40 pts', 'They can teach what you want to learn', 'Compares their teach skills against your learn skills'],
              ['10 pts', 'Compatible skill levels', 'Teacher level is at or above learner level'],
              ['10 pts', 'Compatible availability & mode', 'Flexible matches anything; both match Online/Offline'],
            ].map(([pts, t, d]) => (
              <div key={t} className="flex items-center gap-4 rounded-xl border border-hairline bg-page px-5 py-4">
                <span className="mono w-16 shrink-0 rounded-lg bg-accent/12 py-2 text-center text-sm font-medium text-accent-deep">{pts}</span>
                <div>
                  <p className="font-medium text-ink">{t}</p>
                  <p className="text-sm text-ink-2">{d}</p>
                </div>
              </div>
            ))}
            <p className="mt-2 text-center text-sm text-ink-3">100 = perfect two-way swap · 40{'–'}80 = one-way + credit eligible · below 40 = not shown</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle kicker="Everything in scope" title="A complete SE project, not a listing site" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['JWT auth + roles', 'Student and Admin roles, bcrypt-hashed passwords, protected routes.'],
            ['Skill profiles', 'Admin-managed skill list keeps names consistent — no duplicates.'],
            ['Swap requests', 'Pending, Accepted, Rejected, Cancelled. Nothing happens without consent.'],
            ['Sessions', 'Scheduled, Completed, Cancelled — with date, time, duration and mode.'],
            ['Ratings & badges', 'Average rating plus Helpful Mentor, Active Learner, Reliable Partner.'],
            ['Skill Credits', 'Teach to earn, spend to learn. Balances can never go negative.'],
            ['Reports', 'Report misuse; admins review, resolve, suspend if needed.'],
            ['Admin dashboard', 'Users, skills, requests, sessions, reports — one control room.'],
            ['Documented API', 'REST + Postman-testable, MongoDB with in-memory fallback for demos.'],
          ].map(([t, d]) => (
            <div key={t} className="card p-6">
              <h3 className="text-lg font-medium text-ink">{t}</h3>
              <p className="mt-2 text-sm text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CREDITS — the second rich moment */}
      <section id="credits" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-amber-50 via-page to-surface p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="kicker">Skill Credit economy</p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-ink">Not every match is perfect. Credits fix that.</h2>
              <p className="mt-4 text-ink-2">Teach any session, earn <b className="font-medium text-ink">+1 credit</b>. Request a one-way lesson, spend <b className="font-medium text-ink">1 credit</b>. New students start with 2 free credits.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['+1', 'per session taught'], ['2', 'free on signup'], ['0', 'minimum — never negative']].map(([a, b]) => (
                <div key={b} className="rounded-xl border border-hairline bg-surface p-5">
                  <p className="mono text-3xl font-medium text-accent-deep">{a}</p>
                  <p className="mt-1 text-xs text-ink-3">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24 text-center">
        <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-ink">
          Someone on campus knows
          <br />
          exactly what you want to learn.
        </h2>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="btn btn-primary">Create free account</Link>
          <Link to="/login" className="btn btn-secondary">Log in</Link>
        </div>
        <p className="mt-6 text-xs text-ink-3">Demo: admin@skillswap.local / admin123 · rahim@student.local / student123 · Team CodeXchange</p>
      </section>

      <footer className="border-t border-hairline py-8 text-center text-sm text-ink-3">
        SkillSwap · Software Engineering Lab · MERN · Matching + Requests + Sessions + Reviews + Credits + Admin
      </footer>
    </div>
  );
}
