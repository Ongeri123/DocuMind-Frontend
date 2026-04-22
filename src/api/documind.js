import { supabase } from '../lib/supabase'

const BASE_URL = 'http://localhost:5000/api'

const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Access token:', session?.access_token)
  console.log('User ID:', session?.user?.id)
  return {
     'Authorization': `Bearer ${session?.access_token}`,
    'X-User-Id': session?.user?.id
  }
}

export const uploadDocument = async (file) => {
  const formData = new FormData()
  const headers = await getHeaders()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData
  })

  return response.json()
}

export const streamChat = (question, documentId, sessionId,  onToken, onDone) => {
  let fullAnswer = ''
  const called = { done: false }

  const callDone = () => {
    if (!called.done) {
      called.done = true
      onDone(fullAnswer)
    }
  }

  supabase.auth.getSession().then(({ data: { session } }) => {
    fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'X-User-Id': session?.user?.id
      },
      body: JSON.stringify({
        question,
        document_id: documentId,
        session_id: sessionId
      })
    }).then(response => {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) { callDone(); return }

          const text = decoder.decode(value)
          const lines = text.split('\n')

          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const data = line.replace('data: ', '').trim()
              if (data === '[DONE]') return
              try {
                const { token } = JSON.parse(data)
                fullAnswer += token
                onToken(token)
              } catch (e) {}
            }
          })

          read()
        })
      }
      read()
    })
  })
}
export const createSession = async (documentId) => {
  const headers = await getHeaders()
  const response = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: {...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId })
  })
  return response.json()
}

export const getMessages = async (sessionId) => {
  const headers = await getHeaders()
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/messages`, {
    headers
  })
  return response.json()
}
export const getDocuments = async () => {
  const headers = await getHeaders()
  const response = await fetch(`${BASE_URL}/documents`, {
    headers
  })
  return response.json()
}

export const toggleStar = async (documentId, starred) => {
  const headers = await getHeaders()
  const response = await fetch(`${BASE_URL}/documents/${documentId}/star`, {
    method: 'PATCH',
    headers: {...headers, 'Content-Type': 'application/json'},
    body: JSON.stringify({ starred })
  })
  return response.json()
}

export const getSessions = async () => {
  const headers = await getHeaders()
  const response = await fetch(`${BASE_URL}/sessions/all`, {
    headers
  })
  return response.json()
}

export const deleteDocument = async (documentId) => {
  const headers = await getHeaders()
  const response = await fetch(`${BASE_URL}/documents/${documentId}`, {
    method: 'DELETE',
    headers
  })
  return response.json()
}