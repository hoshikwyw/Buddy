import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query,
  orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BuddyStatus = 'active' | 'cool' | 'urgent'

export interface Buddy {
  id:                  string
  name:                string
  initials:            string
  birthday:            string | null   // 'YYYY-MM-DD'
  status:              BuddyStatus
  bio:                 string
  loreNotes:           string
  lastInteractionDate: Date | null
  avatarBg:            string
  createdAt:           Date | null
}

export interface BuddyInput {
  name:      string
  birthday?: string
  bio?:      string
  loreNotes?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#FFDAB9', '#E6E6FA', '#C8F5E0', '#FFE4E1',
  '#FFF9C4', '#FFD4B8', '#D4F0FF', '#FFD6E7',
]

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export function calcStatus(birthday: string | null, lastInteraction: Date | null): BuddyStatus {
  // 1. Birthday today → urgent
  if (birthday) {
    const today = new Date()
    const [, mm, dd] = birthday.split('-')
    if (
      parseInt(mm) === today.getMonth() + 1 &&
      parseInt(dd) === today.getDate()
    ) return 'urgent'
  }
  // 2. No contact in 14+ days → cool
  if (lastInteraction) {
    const diffDays = (Date.now() - lastInteraction.getTime()) / 86_400_000
    if (diffDays > 14) return 'cool'
  }
  return 'active'
}

export function getStatusLabel(buddy: Buddy): string {
  switch (buddy.status) {
    case 'urgent':
      if (buddy.birthday) {
        const today = new Date()
        const [, mm, dd] = buddy.birthday.split('-')
        if (parseInt(mm) === today.getMonth() + 1 && parseInt(dd) === today.getDate()) {
          return '🎂 Birthday today!'
        }
      }
      return '⚡ Needs attention'
    case 'cool':
      if (buddy.lastInteractionDate) {
        const days = Math.floor((Date.now() - buddy.lastInteractionDate.getTime()) / 86_400_000)
        return `⏰ ${days} days silent`
      }
      return '⏰ Silent for a while'
    case 'active':
      return '💬 Active'
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBuddies(uid: string | null) {
  const [buddies, setBuddies] = useState<Buddy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setBuddies([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'users', uid, 'buddies'),
      orderBy('createdAt', 'asc'),
    )

    const unsub = onSnapshot(q, snap => {
      const data: Buddy[] = snap.docs.map(d => {
        const raw          = d.data()
        const lastDate     = raw.lastInteractionDate instanceof Timestamp
          ? raw.lastInteractionDate.toDate()
          : null
        const birthday     = raw.birthday ?? null

        return {
          id:                  d.id,
          name:                raw.name     ?? '',
          initials:            getInitials(raw.name ?? ''),
          birthday,
          bio:                 raw.bio      ?? '',
          loreNotes:           raw.loreNotes ?? '',
          lastInteractionDate: lastDate,
          avatarBg:            raw.avatarBg ?? AVATAR_COLORS[0],
          createdAt:           raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : null,
          // Recalculate status client-side so birthdays are always live
          status:              calcStatus(birthday, lastDate),
        }
      })
      setBuddies(data)
      setLoading(false)
    })

    return unsub
  }, [uid])

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async function addBuddy(input: BuddyInput) {
    if (!uid) return
    const avatarBg = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    await addDoc(collection(db, 'users', uid, 'buddies'), {
      name:                input.name.trim(),
      birthday:            input.birthday?.trim() || null,
      bio:                 input.bio?.trim()       || '',
      loreNotes:           input.loreNotes?.trim() || '',
      avatarBg,
      lastInteractionDate: serverTimestamp(),
      createdAt:           serverTimestamp(),
    })
  }

  async function updateBuddy(buddyId: string, data: Partial<BuddyInput>) {
    if (!uid) return
    await updateDoc(doc(db, 'users', uid, 'buddies', buddyId), { ...data })
  }

  async function deleteBuddy(buddyId: string) {
    if (!uid) return
    await deleteDoc(doc(db, 'users', uid, 'buddies', buddyId))
  }

  return { buddies, loading, addBuddy, updateBuddy, deleteBuddy }
}
