import { useState, useCallback } from 'react'
import { streamChat } from '../api/documind'

export const useSSE = () => {
  const [answer, setAnswer] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState('')

  const ask = useCallback((question, documentId, sessionId, onComplete) => {
    setAnswer('')
    setStreamError('')
    setIsStreaming(true)

    streamChat(
      question,
      documentId,
      sessionId,
      (token) => setAnswer(prev => prev + token),
      (fullAnswer) => {
        setIsStreaming(false)
        onComplete(fullAnswer)
      },
      (err) => {
        setIsStreaming(false)
        setStreamError(err || 'Something went wrong')
      }
    )
  }, [])

  return { answer, isStreaming, streamError, ask }
}