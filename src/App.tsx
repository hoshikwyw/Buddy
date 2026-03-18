import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Send, Bot } from 'lucide-react'
import clsx from 'clsx'
import { geminiModel } from './lib/gemini'
import type { ChatSession } from '@google/generative-ai'
import './App.css'

const SYSTEM_PROMPT = `You are Buddy, a friendly and chill AI companion. You're warm, casual, and fun to talk to. Keep responses conversational and relaxed — like chatting with a good friend. Don't be overly formal or verbose.`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<ChatSession | null>(null)

  // Start a Gemini chat session once
  useEffect(() => {
    chatRef.current = geminiModel.startChat({
      systemInstruction: SYSTEM_PROMPT,
      history: [],
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading || !chatRef.current) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const result = await chatRef.current.sendMessage(text)
      const reply = result.response.text()
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error(err)
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Oops, something went wrong. Try again!' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  return (
    <div className="chat-layout">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-inner">
          <div className="buddy-avatar">
            <Bot size={20} />
          </div>
          <div>
            <p className="buddy-title">Buddy</p>
            <span className="buddy-status">Always here to chat</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-avatar">
              <Bot size={32} />
            </div>
            <p className="chat-empty-title">Hey, I'm Buddy!</p>
            <p className="chat-empty-sub">Your chill AI companion. What's on your mind?</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={clsx('message', msg.role)}>
            {msg.role === 'assistant' && (
              <div className="message-avatar">
                <Bot size={15} />
              </div>
            )}
            <div className="message-bubble">
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Bot size={15} />
            </div>
            <div className="message-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="chat-footer">
        <div className="chat-input-wrap">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="Say something..."
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            <Send size={17} />
          </button>
        </div>
        <p className="chat-hint">Enter to send · Shift+Enter for new line</p>
      </footer>
    </div>
  )
}

export default App
