import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSSE } from '../hooks/useSSE'
import useDocuMind from '../store/useDocumind'
import { createSession, getMessages } from '../api/documind'

export default function ChatPage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const { answer, isStreaming, streamError, ask } = useSSE()
  const activeDocument = useDocuMind(s => s.activeDocument)
  const activeSessionId = useDocuMind(s => s.activeSessionId)
  const { setActiveSessionId } = useDocuMind()

  const messagesEndRef = useRef(null)
  const isStreamingRef = useRef(false)

  // Only scroll on new messages, not on every streamed token
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Scroll to bottom when streaming starts
  useEffect(() => {
    if (isStreaming && !isStreamingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    isStreamingRef.current = isStreaming
  }, [isStreaming])

  useEffect(() => {
    if (!activeDocument) return
    const initSession = async () => {
      let sid = activeSessionId
      if (sid) {
        setSessionId(sid)
        const history = await getMessages(sid)
        if (history.messages?.length > 0) {
          setMessages(history.messages.map(m => ({ role: m.role, content: m.content })))
        }
      } else {
        const session = await createSession(activeDocument.id)
        if (session.session_id) {
          sid = session.session_id
          setSessionId(sid)
          const history = await getMessages(sid)
          if (history.messages?.length > 0) {
            setMessages(history.messages.map(m => ({ role: m.role, content: m.content })))
          }
        }
      }
      setActiveSessionId(null)
    }
    initSession()
  }, [activeDocument, activeSessionId, setActiveSessionId])

  const handleSend = useCallback(() => {
    if (!question.trim() || !activeDocument || !sessionId || isStreaming) return
    const currentQuestion = question
    setMessages(prev => [...prev, { role: 'user', content: currentQuestion }])
    setQuestion('')
    ask(currentQuestion, activeDocument.id, sessionId, (fullAnswer) => {
      setMessages(prev => [...prev, { role: 'assistant', content: fullAnswer }])
    })
  }, [question, activeDocument, sessionId, isStreaming, ask])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend()
  }, [handleSend])

  return (
    <div className="flex flex-col bg-bg" style={{ height: '100dvh' }}>

      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3 bg-sidebar flex-shrink-0 min-w-0">
        <button
          onClick={() => navigate('/')}
          className="text-muted hover:text-text-main transition-colors flex-shrink-0 px-1"
          aria-label="Back"
        >
          ←
        </button>
        <div className="w-px h-4 bg-white/10 flex-shrink-0" />
        <h2 className="font-display font-medium text-text-main text-sm truncate min-w-0">
          {activeDocument?.filename}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-5 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-xl px-4 py-2.5 rounded-xl text-sm leading-relaxed break-words ${
              msg.role === 'user'
                ? 'bg-surface2 text-text-main'
                : 'bg-surface border border-white/[0.08] text-text-main'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[75%] md:max-w-xl px-4 py-2.5 rounded-xl text-sm leading-relaxed break-words bg-surface border border-white/[0.08] text-text-main">
              {answer || <span className="text-muted">Thinking...</span>}
              {answer && <span className="cursor-blink">▋</span>}
            </div>
          </div>
        )}
        {streamError && (
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[75%] md:max-w-xl px-4 py-2.5 rounded-xl text-sm bg-coral/10 border border-coral/20 text-coral">
              {streamError}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 sm:px-4 py-3 border-t border-white/[0.06] flex gap-2 bg-sidebar flex-shrink-0">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something about this document..."
          className="flex-1 min-w-0 bg-surface2 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-text-main outline-none focus:border-white/20 transition-colors placeholder:text-muted"
          disabled={isStreaming}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !question.trim()}
          className="bg-text-main text-bg px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-white/90 transition-colors flex-shrink-0 whitespace-nowrap"
        >
          {isStreaming ? 'Thinking…' : 'Send'}
        </button>
      </div>

    </div>
  )
}
