import { useState } from 'react'
import {
  Search, Settings, Bell, Sparkles,
  MessageCircle, X, ChevronRight, Heart,
} from 'lucide-react'
import './App.css'

// ── Types ────────────────────────────────────────────────────────────────────

type Status = 'urgent' | 'cool' | 'active'

interface Contact {
  id: number
  name: string
  initials: string
  status: Status
  statusLabel: string
  avatarBg: string
}

// ── Data ─────────────────────────────────────────────────────────────────────

const CONTACTS: Contact[] = [
  { id: 1, name: 'Aung',  initials: 'AU', status: 'urgent', statusLabel: '🎂 Birthday today!',      avatarBg: '#FFDAB9' },
  { id: 2, name: 'Su Su', initials: 'SS', status: 'cool',   statusLabel: '⏰ 2 weeks silent',        avatarBg: '#E6E6FA' },
  { id: 3, name: 'Kyaw',  initials: 'KY', status: 'active', statusLabel: '💬 Active',               avatarBg: '#C8F5E0' },
  { id: 4, name: 'May',   initials: 'MA', status: 'active', statusLabel: '💬 Active',               avatarBg: '#FFE4E1' },
  { id: 5, name: 'Thida', initials: 'TH', status: 'cool',   statusLabel: '⏰ 1 week silent',         avatarBg: '#FFF9C4' },
  { id: 6, name: 'Zaw',   initials: 'ZA', status: 'urgent', statusLabel: '⚡ Needs attention',       avatarBg: '#FFD4B8' },
]

const LORE_CHIPS = [
  "What is Su Su's favorite food?",
  "When is Aung's birthday?",
  "What did Kyaw say last week?",
]

const STATUS_DOT: Record<Status, string> = {
  urgent: '#ef4444',
  cool:   '#f59e0b',
  active: '#22c55e',
}

const STATUS_RING: Record<Status, string> = {
  urgent: 'ring-urgent',
  cool:   'ring-cool',
  active: 'ring-active',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function App() {
  const [search, setSearch]           = useState('')
  const [sparkDismissed, setDismissed] = useState(false)

  return (
    <div className="app-root">
      {/* Ambient background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="app-container">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="app-header">
          <div>
            <p className="greeting-eyebrow">✨ {getGreeting()}, Alex</p>
            <h1 className="greeting-title">Who are we thinking<br />about today?</h1>
          </div>

          <div className="header-icons">
            <button className="icon-pill" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="icon-pill avatar-pill" aria-label="Profile">
              A
            </button>
          </div>
        </header>

        {/* ── Buddy's Circle ──────────────────────────────────────────── */}
        <section className="section">
          <div className="section-row">
            <h2 className="section-title">Buddy's Circle</h2>
            <button className="see-all">
              See all <ChevronRight size={13} />
            </button>
          </div>

          <div className="circle-scroll">
            {CONTACTS.map(c => (
              <button key={c.id} className="contact-btn">
                {/* Spinning glow ring */}
                <div className={`ring-wrap ${STATUS_RING[c.status]}`}>
                  <div className="avatar" style={{ background: c.avatarBg }}>
                    {c.initials}
                  </div>
                  {/* Status dot */}
                  <span className="dot" style={{ background: STATUS_DOT[c.status] }} />
                </div>

                <span className="contact-name">{c.name}</span>
                <span className="contact-label">{c.statusLabel}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Daily Spark ─────────────────────────────────────────────── */}
        <section className="section">
          <div className="section-row">
            <h2 className="section-title">Daily Spark</h2>
          </div>

          {sparkDismissed ? (
            <div className="spark-empty">
              <Heart size={22} color="#FFDAB9" />
              <p>You're all caught up! Check back later.</p>
            </div>
          ) : (
            <div className="spark-card">
              {/* Decorative orb */}
              <div className="spark-orb" />

              <button
                className="spark-close"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>

              <div className="spark-icon">
                <Sparkles size={20} />
              </div>

              <p className="spark-eyebrow">Buddy says</p>
              <p className="spark-message">
                Your friend <strong>Aung</strong> mentioned he was feeling sick
                yesterday. Should I draft a quick "Get well soon" message?
              </p>

              <div className="spark-actions">
                <button className="btn-primary">
                  <MessageCircle size={15} />
                  Draft Message
                </button>
                <button className="btn-ghost" onClick={() => setDismissed(true)}>
                  Ignore
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Lore Vault ──────────────────────────────────────────────── */}
        <section className="section">
          <div className="section-row">
            <h2 className="section-title">The Lore Vault</h2>
          </div>

          <div className="search-wrap">
            <Search size={17} className="search-icon" />
            <input
              className="search-input"
              type="text"
              placeholder="Ask Buddy anything about your friends..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="chip-row">
            {LORE_CHIPS.map(q => (
              <button key={q} className="chip" onClick={() => setSearch(q)}>
                {q}
              </button>
            ))}
          </div>
        </section>

        {/* Bottom padding */}
        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
