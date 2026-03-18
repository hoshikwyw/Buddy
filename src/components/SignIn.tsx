import { motion } from 'framer-motion'
import { signInWithGoogle } from '../lib/firebase'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', damping: 20, stiffness: 240 } },
}

const featureVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
}

const featureItem = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', damping: 20 } },
}

const FEATURES = [
  { emoji: '🧠', text: 'AI remembers every detail about your friends' },
  { emoji: '💬', text: 'Get thoughtful prompts to stay connected' },
  { emoji: '🔒', text: 'Your data is private — only you can see it' },
]

export function SignIn() {
  return (
    <div className="signin-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="signin-container">
        <motion.div
          className="signin-card"
          variants={cardVariant}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="signin-logo"
            animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            🤝
          </motion.div>

          <h1 className="signin-title">Welcome to Buddy</h1>
          <p className="signin-sub">
            Your AI-powered relationship assistant.<br />
            Remember what matters most.
          </p>

          {/* Feature list */}
          <motion.ul
            className="signin-features"
            variants={featureVariants}
            initial="hidden"
            animate="show"
          >
            {FEATURES.map(f => (
              <motion.li key={f.text} variants={featureItem} className="signin-feature">
                <span className="signin-feature-emoji">{f.emoji}</span>
                <span>{f.text}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Sign-in button */}
          <motion.button
            className="signin-google-btn"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={signInWithGoogle}
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          <p className="signin-footer">
            By signing in, your data is stored securely under your own account.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
