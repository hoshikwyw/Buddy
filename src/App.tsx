import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Search, Bell, Sparkles, MessageCircle,
  X, Heart, Plus, Copy, Check, Share2, LogOut,
} from 'lucide-react'

import { useAuth }      from './hooks/useAuth'
import { useBuddies, getStatusLabel, type Buddy, type BuddyStatus } from './hooks/useBuddies'
import { signOutUser }  from './lib/firebase'
import { SignIn }        from './components/SignIn'
import { AddBuddyModal } from './components/AddBuddyModal'
import './App.css'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<BuddyStatus, string> = {
  urgent: '#ef4444',
  cool:   '#f59e0b',
  active: '#22c55e',
}

const STATUS_RING: Record<BuddyStatus, string> = {
  urgent: 'ring-urgent',
  cool:   'ring-cool',
  active: 'ring-active',
}

const LORE_CHIPS = [
  "What is their favorite food?",
  "Who has a birthday coming up?",
  "Who haven't I talked to in a while?",
]

// ── Spark helpers ─────────────────────────────────────────────────────────────

type SparkType = 'birthday' | 'reconnect' | 'attention'

interface Spark {
  buddy: Buddy
  type:  SparkType
}

function buildDraftMessage(buddy: Buddy, type: SparkType): string {
  if (type === 'birthday')
    return `Hey ${buddy.name}! 🎂 Wishing you the happiest of birthdays! Hope your day is filled with joy and love. Let's celebrate soon! 🎉`
  if (type === 'reconnect')
    return `Hey ${buddy.name}! 👋 It's been a while — you've been on my mind lately. Hope everything is going great your end! Would love to catch up soon? 😊`
  return `Hey ${buddy.name}! Just checking in to see how you're doing. You mean a lot and I wanted you to know you're thought of! 💙`
}

function getSparkMessage(spark: Spark): string {
  const { buddy, type } = spark
  if (type === 'birthday')
    return `🎂 Today is ${buddy.name}'s birthday! Should I draft a heartfelt birthday message?`
  if (type === 'reconnect')
    return `You haven't talked to ${buddy.name} in a while. Should I draft a quick "thinking of you" message?`
  return `${buddy.name} might need your attention. Should I help you reach out?`
}

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 260 } },
}

const sparkVariant: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', damping: 18, stiffness: 220, delay: 0.15 } },
}

const circleContainer: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const circleItem: Variants = {
  hidden: { opacity: 0, scale: 0.78, y: 12 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { type: 'spring', damping: 16, stiffness: 280 } },
}

const sheetVariant: Variants = {
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

// ── Loading screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="loading-root">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      <motion.div
        className="loading-logo"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      >
        🤝
      </motion.div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { buddies, loading: buddiesLoading, addBuddy } = useBuddies(user?.uid ?? null)

  const [search,         setSearch]        = useState('')
  const [sparkDismissed, setDismissed]     = useState(false)
  const [draftOpen,      setDraftOpen]     = useState(false)
  const [addBuddyOpen,   setAddBuddyOpen]  = useState(false)
  const [typedMsg,       setTypedMsg]      = useState('')
  const [draftDone,      setDraftDone]     = useState(false)
  const [copied,         setCopied]        = useState(false)

  // ── Compute spark from live buddy data ────────────────────────────────────

  const spark = useMemo<Spark | null>(() => {
    if (!buddies.length) return null
    const today = new Date()

    const birthdayBuddy = buddies.find(b => {
      if (!b.birthday) return false
      const [, mm, dd] = b.birthday.split('-')
      return parseInt(mm) === today.getMonth() + 1 && parseInt(dd) === today.getDate()
    })
    if (birthdayBuddy) return { buddy: birthdayBuddy, type: 'birthday' }

    const coolBuddy = buddies.find(b => b.status === 'cool')
    if (coolBuddy) return { buddy: coolBuddy, type: 'reconnect' }

    const urgentBuddy = buddies.find(b => b.status === 'urgent')
    if (urgentBuddy) return { buddy: urgentBuddy, type: 'attention' }

    return { buddy: buddies[0], type: 'reconnect' }
  }, [buddies])

  const draftMessage = spark ? buildDraftMessage(spark.buddy, spark.type) : ''

  // Reset dismissed state when spark changes buddy
  useEffect(() => { setDismissed(false) }, [spark?.buddy.id])

  // ── Typing animation ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!draftOpen || !draftMessage) {
      setTypedMsg(''); setDraftDone(false); return
    }

    const delay = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setTypedMsg(draftMessage.slice(0, i))
        if (i >= draftMessage.length) { clearInterval(interval); setDraftDone(true) }
      }, 26)
      return () => clearInterval(interval)
    }, 550)

    return () => clearTimeout(delay)
  }, [draftOpen, draftMessage])

  // ── Clipboard ─────────────────────────────────────────────────────────────

  async function handleCopy() {
    await navigator.clipboard.writeText(draftMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(draftMessage)}`, '_blank')
  }

  // ── Auth guards ───────────────────────────────────────────────────────────

  if (authLoading)  return <LoadingScreen />
  if (!user)        return <SignIn />

  // ── Render ────────────────────────────────────────────────────────────────

  const firstName = user.displayName?.split(' ')[0] ?? 'there'

  return (
    <div className="app-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="app-container">

        {/* ── Header ────────────────────────────────────────────────── */}
        <motion.header className="app-header" variants={fadeUp} initial="hidden" animate="show">
          <div>
            <p className="greeting-eyebrow">✨ {getGreeting()}, {firstName}</p>
            <h1 className="greeting-title">Who are we thinking<br />about today?</h1>
          </div>

          <div className="header-icons">
            <motion.button className="icon-pill" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} aria-label="Notifications">
              <Bell size={18} />
            </motion.button>

            {/* User avatar + sign-out */}
            <div className="user-menu">
              {user.photoURL
                ? <img src={user.photoURL} className="user-photo" alt={user.displayName ?? ''} referrerPolicy="no-referrer" />
                : <div className="icon-pill avatar-pill">{firstName[0]}</div>
              }
              <motion.button
                className="signout-btn"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={signOutUser}
                title="Sign out"
              >
                <LogOut size={15} />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* ── Buddy's Circle ─────────────────────────────────────── */}
        <motion.section className="section" variants={fadeUp} initial="hidden" animate="show">
          <div className="section-row">
            <h2 className="section-title">Buddy's Circle</h2>
            <motion.button
              className="icon-pill add-pill"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setAddBuddyOpen(true)}
              aria-label="Add buddy"
            >
              <Plus size={16} />
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {buddiesLoading ? (
              /* Skeleton */
              <motion.div key="skeleton" className="circle-scroll" exit={{ opacity: 0 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="contact-btn">
                    <div className="skeleton-ring" />
                    <div className="skeleton-line" style={{ width: 40 }} />
                  </div>
                ))}
              </motion.div>
            ) : buddies.length > 0 ? (
              /* Active state */
              <motion.div
                key="active"
                className="circle-scroll"
                variants={circleContainer}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
              >
                {buddies.map(c => (
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
                    <span className="contact-label">{getStatusLabel(c)}</span>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              /* Empty state */
              <motion.div
                key="empty"
                className="circle-empty-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1, transition: { type: 'spring', damping: 20 } }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="circle-empty-emoji"
                  animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                  transition={{ delay: 0.4, duration: 0.8 }}
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
                  onClick={() => setAddBuddyOpen(true)}
                >
                  <Plus size={16} />
                  Add Buddy
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Daily Spark ─────────────────────────────────────────── */}
        <section className="section">
          <div className="section-row">
            <h2 className="section-title">Daily Spark</h2>
          </div>

          <AnimatePresence mode="wait">
            {!spark || sparkDismissed ? (
              <motion.div
                key="empty-spark"
                className="spark-empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Heart size={22} color="#FFDAB9" />
                <p>
                  {buddies.length === 0
                    ? 'Add your first Buddy to see daily sparks!'
                    : "You're all caught up! Check back later."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`spark-${spark.buddy.id}`}
                className="spark-card"
                variants={sparkVariant}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.18 } }}
                whileHover={{ y: -3, transition: { type: 'spring', damping: 20 } }}
              >
                <div className="spark-orb" />

                <motion.button
                  className="spark-close"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDismissed(true)}
                >
                  <X size={15} />
                </motion.button>

                {/* Buddy's avatar in spark */}
                <div className="spark-buddy-row">
                  <div className="spark-buddy-avatar" style={{ background: spark.buddy.avatarBg }}>
                    {spark.buddy.initials}
                  </div>
                  <div className="spark-icon">
                    <Sparkles size={18} />
                  </div>
                </div>

                <p className="spark-eyebrow">Buddy says</p>
                <p className="spark-message">{getSparkMessage(spark)}</p>

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

        {/* ── Lore Vault ──────────────────────────────────────────── */}
        <motion.section className="section" variants={fadeUp} initial="hidden" animate="show">
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

      {/* ── Draft Message Sheet ────────────────────────────────────── */}
      <AnimatePresence>
        {draftOpen && spark && (
          <>
            <motion.div
              className="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDraftOpen(false)}
            />
            <motion.div
              className="draft-sheet"
              variants={sheetVariant}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="sheet-handle" />

              <div className="sheet-header">
                <div>
                  <p className="sheet-title">Buddy's Draft ✨</p>
                  <p className="sheet-subtitle">
                    For {spark.buddy.name} ·{' '}
                    {spark.type === 'birthday' ? 'Birthday' : spark.type === 'reconnect' ? 'Reconnect' : 'Check-in'}
                  </p>
                </div>
                <motion.button
                  className="sheet-close"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDraftOpen(false)}
                >
                  <X size={17} />
                </motion.button>
              </div>

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

              <div className="sheet-bubble-wrap">
                <div className="sheet-bubble">
                  <span>{typedMsg}</span>
                  {!draftDone && <span className="cursor-blink">|</span>}
                </div>
              </div>

              <p className="sheet-hint">
                {draftDone ? '✅ Message ready — copy or send directly!' : 'AI is crafting your message...'}
              </p>

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

      {/* ── Add Buddy Modal ────────────────────────────────────────── */}
      <AddBuddyModal
        open={addBuddyOpen}
        onClose={() => setAddBuddyOpen(false)}
        onSave={addBuddy}
      />
    </div>
  )
}
