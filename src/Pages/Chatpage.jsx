import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSSE } from '../hooks/useSSE'
import useDocuMind from '../store/useDocumind'
import { createSession, getMessages } from '../api/documind'

export default function ChatPage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const { answer, isStreaming, ask } = useSSE()
  const activeDocument = useDocuMind(s => s.activeDocument)
  const activeSessionId = useDocuMind(s => s.activeSessionId)
  const { setActiveSessionId } = useDocuMind()

useEffect(() => {
  if (!activeDocument) return

  const initSession = async () => {
    let sid = activeSessionId

    if (sid) {
      // resuming existing session — just load messages
      setSessionId(sid)
      const history = await getMessages(sid)
      if (history.messages?.length > 0) {
        setMessages(history.messages.map(m => ({
          role: m.role,
          content: m.content
        })))
      }
    } else {
      // new session — create one
      const session = await createSession(activeDocument.id)
      if (session.session_id) {
        sid = session.session_id
        setSessionId(sid)
        // load messages for this session
        const history = await getMessages(sid)
        if (history.messages?.length > 0) {
          setMessages(history.messages.map(m => ({
            role: m.role,
            content: m.content
          })))
        }
      }
    }

    // clear activeSessionId after using it
    setActiveSessionId(null)
  }

  initSession()
}, [activeDocument, activeSessionId, setActiveSessionId])

  const handleSend = () => {
    if (!question.trim() || !activeDocument || !sessionId || isStreaming) return

    const currentQuestion = question

    // add user message immediately
    setMessages(prev => [...prev, {
      role: 'user',
      content: currentQuestion
    }])

    setQuestion('')

    // ask — when done, add assistant message directly in callback
    ask(currentQuestion, activeDocument.id, sessionId, (fullAnswer) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fullAnswer
      }])
    })
  }

  return (
    <div className="flex flex-col h-screen bg-bg">

      <div className="p-4 border-b border-white/7 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-muted text-sm font-mono hover:text-accent transition-colors"
        >
          ← Back
        </button>
        <h2 className="font-display font-semibold text-text-main">
          {activeDocument?.filename}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg text-sm font-body ${
              msg.role === 'user'
                ? 'bg-blue-400 text-bg'
                : 'bg-surface text-text-main border border-white/7'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* live streaming display */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-xl p-3 rounded-lg text-sm font-body bg-surface text-text-main border border-white/7">
              {answer}
              <span className="cursor-blink">▋</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/7 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask something about this document..."
          className="flex-1 bg-surface border border-white/7 rounded-lg px-4 py-2 text-sm font-mono text-text-main outline-none focus:border-accent transition-colors"
          disabled={isStreaming}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !question.trim()}
          className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-mono disabled:opacity-50 hover:opacity-85 transition-opacity"
        >
          {isStreaming ? 'Thinking...' : 'Send →'}
        </button>
      </div>

    </div>
  )
}