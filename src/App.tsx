import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Sparkles, MessageCircle,
  X, ChevronRight, Heart, Plus, Copy, Check, Share2,
} from 'lucide-react'
import './App.css'

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = 'urgent' | 'cool' | 'active'

interface Contact {
  id: number
  name: string
  initials: string
  status: Status
  statusLabel: string
  avatarBg: string
}

// ── Data ──────────────────────────────────────────────────────────────────────

const ALL_CONTACTS: Contact[] = [
  { id: 1, name: 'Aung',  initials: 'AU', status: 'urgent', statusLabel: '🎂 Birthday today!',    avatarBg: '#FFDAB9' },
  { id: 2, name: 'Su Su', initials: 'SS', status: 'cool',   statusLabel: '⏰ 2 weeks silent',      avatarBg: '#E6E6FA' },
  { id: 3, name: 'Kyaw',  initials: 'KY', status: 'active', statusLabel: '💬 Active',             avatarBg: '#C8F5E0' },
  { id: 4, name: 'May',   initials: 'MA', status: 'active', statusLabel: '💬 Active',             avatarBg: '#FFE4E1' },
  { id: 5, name: 'Thida', initials: 'TH', status: 'cool',   statusLabel: '⏰ 1 week silent',       avatarBg: '#FFF9C4' },
  { id: 6, name: 'Zaw',   initials: 'ZA', status: 'urgent', statusLabel: '⚡ Needs attention',     avatarBg: '#FFD4B8' },
]

const DRAFT_MESSAGE =
  `Hey Aung! 👋 Heard you weren't feeling well — hope you're getting some proper rest! 🌿 Let me know if you need anything at all. Wishing you a speedy recovery! 💙`

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

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 260 } },
}

const sparkVariant = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 18, stiffness: 220, delay: 0.15 } },
}

const circleContainer = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const circleItem = {
  hidden: { opacity: 0, scale: 0.78, y: 12 },
  show:   { opacity: 1, scale: 1,   y: 0,   transition: { type: 'spring', damping: 16, stiffness: 280 } },
}

const sheetVariant = {
  hidden: { y: '100%' },
  show:   { y: 0,      transition: { type: 'spring', damping: 30, stiffness: 320 } },
  exit:   { y: '100%', transition: { type: 'spring', damping: 30, stiffness: 320 } },
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
  // Empty-state toggle (demo)
  const [hasContacts, setHasContacts]     = useState(true)

  // Spark card
  const [sparkDismissed, setDismissed]    = useState(false)

  // Draft sheet
  const [draftOpen, setDraftOpen]         = useState(false)
  const [typedMsg, setTypedMsg]           = useState('')
  const [draftDone, setDraftDone]         = useState(false)
  const [copied, setCopied]               = useState(false)

  // Search
  const [search, setSearch]               = useState('')

  const contacts = hasContacts ? ALL_CONTACTS : []

  // ── Typing animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!draftOpen) {
      setTypedMsg('')
      setDraftDone(false)
      return
    }

    // Small delay before typing starts
    const startDelay = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setTypedMsg(DRAFT_MESSAGE.slice(0, i))
        if (i >= DRAFT_MESSAGE.length) {
          clearInterval(interval)
          setDraftDone(true)
        }
      }, 28)
      return () => clearInterval(interval)
    }, 600)

    return () => clearTimeout(startDelay)
  }, [draftOpen])

  // ── Copy to clipboard ───────────────────────────────────────────────────────
  async function handleCopy() {
    await navigator.clipboard.writeText(DRAFT_MESSAGE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  // ── WhatsApp ────────────────────────────────────────────────────────────────
  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(DRAFT_MESSAGE)}`, '_blank')
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="app-container">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.header
          className="app-header"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div>
            <p className="greeting-eyebrow">✨ {getGreeting()}, Alex</p>
            <h1 className="greeting-title">Who are we thinking<br />about today?</h1>
          </div>

          <div className="header-icons">
            <motion.button
              className="icon-pill"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </motion.button>
            <motion.button
              className="icon-pill avatar-pill"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Profile"
            >
              A
            </motion.button>
          </div>
        </motion.header>

        {/* ── Buddy's Circle ──────────────────────────────────────────── */}
        <motion.section
          className="section"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{ transitionDelay: '0.05s' }}
        >
          <div className="section-row">
            <h2 className="section-title">Buddy's Circle</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Demo toggle */}
              <motion.button
                className="toggle-btn"
                whileTap={{ scale: 0.93 }}
                onClick={() => setHasContacts(p => !p)}
                title="Toggle empty state (demo)"
              >
                {hasContacts ? 'Empty state' : 'Show contacts'}
              </motion.button>
              <button className="see-all">
                See all <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {contacts.length > 0 ? (
              /* ── Active State ── */
              <motion.div
                key="active"
                className="circle-scroll"
                variants={circleContainer}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                {contacts.map(c => (
                  <motion.button
                    key={c.id}
                    className="contact-btn"
                    variants={circleItem}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 300 }}
                  >
                    <div className={`ring-wrap ${STATUS_RING[c.status]}`}>
                      <div className="avatar" style={{ background: c.avatarBg }}>
                        {c.initials}
                      </div>
                      <span className="dot" style={{ background: STATUS_DOT[c.status] }} />
                    </div>
                    <span className="contact-name">{c.name}</span>
                    <span className="contact-label">{c.statusLabel}</span>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              /* ── Empty State ── */
              <motion.div
                key="empty"
                className="circle-empty-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1, transition: { type: 'spring', damping: 20 } }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              >
                <motion.div
                  className="circle-empty-emoji"
                  animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                >
                  🫂
                </motion.div>
                <p className="circle-empty-title">Your circle is quiet right now.</p>
                <p className="circle-empty-sub">
                  Add your first Buddy to start building deeper connections!
                </p>
                <motion.button
                  className="add-buddy-btn"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setHasContacts(true)}
                >
                  <Plus size={16} />
                  Add Buddy
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Daily Spark ─────────────────────────────────────────────── */}
        <section className="section">
          <div className="section-row">
            <h2 className="section-title">Daily Spark</h2>
          </div>

          <AnimatePresence mode="wait">
            {sparkDismissed ? (
              <motion.div
                key="empty-spark"
                className="spark-empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Heart size={22} color="#FFDAB9" />
                <p>You're all caught up! Check back later.</p>
              </motion.div>
            ) : (
              <motion.div
                key="spark-card"
                className="spark-card"
                variants={sparkVariant}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.2 } }}
                whileHover={{ y: -3, transition: { type: 'spring', damping: 20 } }}
              >
                <div className="spark-orb" />

                <motion.button
                  className="spark-close"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDismissed(true)}
                  aria-label="Dismiss"
                >
                  <X size={15} />
                </motion.button>

                <div className="spark-icon">
                  <Sparkles size={20} />
                </div>

                <p className="spark-eyebrow">Buddy says</p>
                <p className="spark-message">
                  Your friend <strong>Aung</strong> mentioned he was feeling sick
                  yesterday. Should I draft a quick "Get well soon" message?
                </p>

                <div className="spark-actions">
                  <motion.button
                    className="btn-primary"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setDraftOpen(true)}
                  >
                    <MessageCircle size={15} />
                    Draft Message
                  </motion.button>
                  <motion.button
                    className="btn-ghost"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setDismissed(true)}
                  >
                    Ignore
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Lore Vault ──────────────────────────────────────────────── */}
        <motion.section
          className="section"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{ transitionDelay: '0.25s' }}
        >
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
              <motion.button
                className="search-clear"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSearch('')}
                aria-label="Clear"
              >
                <X size={15} />
              </motion.button>
            )}
          </div>

          <div className="chip-row">
            {LORE_CHIPS.map((q, i) => (
              <motion.button
                key={q}
                className="chip"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.07 } }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSearch(q)}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </motion.section>

        <div style={{ height: 40 }} />
      </div>

      {/* ── Draft Message Sheet ──────────────────────────────────────── */}
      <AnimatePresence>
        {draftOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDraftOpen(false)}
            />

            {/* Bottom sheet */}
            <motion.div
              className="draft-sheet"
              variants={sheetVariant}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {/* Drag handle */}
              <div className="sheet-handle" />

              {/* Sheet header */}
              <div className="sheet-header">
                <div>
                  <p className="sheet-title">Buddy's Draft ✨</p>
                  <p className="sheet-subtitle">For Aung · Get Well Soon</p>
                </div>
                <motion.button
                  className="sheet-close"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDraftOpen(false)}
                  aria-label="Close"
                >
                  <X size={17} />
                </motion.button>
              </div>

              {/* Buddy avatar row */}
              <div className="sheet-buddy-row">
                <div className="sheet-buddy-avatar">
                  <Sparkles size={16} />
                </div>
                <div className="sheet-buddy-info">
                  <span className="sheet-buddy-name">Buddy AI</span>
                  {!draftDone && (
                    <span className="sheet-typing-label">
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      drafting...
                    </span>
                  )}
                </div>
              </div>

              {/* Message bubble */}
              <div className="sheet-bubble-wrap">
                <div className="sheet-bubble">
                  <span>{typedMsg}</span>
                  {!draftDone && <span className="cursor-blink">|</span>}
                </div>
              </div>

              {/* Hint */}
              <p className="sheet-hint">
                {draftDone ? '✅ Message ready — copy or send directly!' : 'AI is crafting your message...'}
              </p>

              {/* Action buttons */}
              <AnimatePresence>
                {draftDone && (
                  <motion.div
                    className="sheet-actions"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { type: 'spring', damping: 22 } }}
                  >
                    <motion.button
                      className={`btn-copy ${copied ? 'btn-copy--done' : ''}`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleCopy}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </motion.button>

                    <motion.button
                      className="btn-whatsapp"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleWhatsApp}
                    >
                      <Share2 size={16} />
                      Send via WhatsApp
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ height: 12 }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
