import { useState, useCallback } from 'react'
import { streamChat } from '../api/documind'

export const useSSE = () => {
  const [answer, setAnswer] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const ask = useCallback((question, documentId, sessionId, onComplete) => {
    setAnswer('')
    setIsStreaming(true)

    streamChat(
      question,
      documentId,
      sessionId,
      (token) => setAnswer(prev => prev + token),
      (fullAnswer) => {
        setIsStreaming(false)
        onComplete(fullAnswer)
      }
    )
  }, [])

  return { answer, isStreaming, ask }
}