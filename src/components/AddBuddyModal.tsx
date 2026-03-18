import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Loader } from 'lucide-react'
import { BuddyInput } from '../hooks/useBuddies'

interface Props {
  open:     boolean
  onClose:  () => void
  onSave:   (input: BuddyInput) => Promise<void>
}

const sheetVariant = {
  hidden: { y: '100%' },
  show:   { y: 0,      transition: { type: 'spring', damping: 30, stiffness: 320 } },
  exit:   { y: '100%', transition: { type: 'spring', damping: 30, stiffness: 320 } },
}

export function AddBuddyModal({ open, onClose, onSave }: Props) {
  const [name,      setName]      = useState('')
  const [birthday,  setBirthday]  = useState('')
  const [bio,       setBio]       = useState('')
  const [loreNotes, setLoreNotes] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  function reset() {
    setName(''); setBirthday(''); setBio(''); setLoreNotes('')
    setError(''); setSaving(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }

    setSaving(true)
    setError('')
    try {
      await onSave({ name, birthday, bio, loreNotes })
      reset()
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="draft-sheet"
            variants={sheetVariant}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="sheet-handle" />

            {/* Header */}
            <div className="sheet-header">
              <div>
                <p className="sheet-title">Add a Buddy ✨</p>
                <p className="sheet-subtitle">Save their lore to your circle</p>
              </div>
              <motion.button
                className="sheet-close"
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={17} />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="buddy-form">

              <div className="form-field">
                <label className="form-label">Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Aung Kyaw"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label className="form-label">Birthday <span className="form-optional">(optional)</span></label>
                <input
                  className="form-input"
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">About them <span className="form-optional">(optional)</span></label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Best friend from university"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Lore Notes
                  <span className="form-optional"> (optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Favorite food, hobbies, things they love or hate, recent life events..."
                  value={loreNotes}
                  onChange={e => setLoreNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <motion.button
                type="submit"
                className="btn-primary form-submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {saving
                  ? <><Loader size={16} className="spin-icon" /> Saving...</>
                  : <><UserPlus size={16} /> Add to Circle</>
                }
              </motion.button>
            </form>

            <div style={{ height: 16 }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
