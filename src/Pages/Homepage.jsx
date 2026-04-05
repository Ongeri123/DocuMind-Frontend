import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import useDocuMind from '../store/useDocumind'
import {
  uploadDocument,
  getDocuments,
  toggleStar,
  getSessions
} from '../api/documind'

export default function HomePage() {
  const navigate = useNavigate()
  const {
    documents,
    activePage,
    setDocuments,
    addDocument,
    setActiveDocument,
    toggleStarred,
    setActiveSessionId
  } = useDocuMind()

  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const load = async () => {
      const result = await getDocuments()
      if (result.documents) setDocuments(result.documents)

      const s = await getSessions()
      if (s.sessions) setSessions(s.sessions)
    }
    load()
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 25 * 1024 * 1024) {
      setStatus('File too large. Maximum 25MB.')
      return
    }

    setUploading(true)
    setStatus('Uploading...')

    try {
      const result = await uploadDocument(file)
      addDocument({
        id: result.document_id,
        filename: file.name,
        starred: false
      })
      setStatus('Ready ✓')
    } catch {
      setStatus('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const openDocument = (doc) => {
    setActiveDocument(doc)
    navigate('/chat')
  }

  const handleStar = async (e, doc) => {
    e.stopPropagation()
    toggleStarred(doc.id)
    await toggleStar(doc.id, !doc.starred)
  }

  const DocumentCard = ({ doc }) => (
    <div
      onClick={() => openDocument(doc)}
      className="flex items-center justify-between p-4 border border-white/7 rounded-lg cursor-pointer hover:border-accent/30 hover:bg-surface2 transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className="text-muted font-mono text-xs">PDF</span>
        <span className="text-sm font-body text-text-main">{doc.filename}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => handleStar(e, doc)}
          className={`text-sm transition-colors ${
            doc.starred ? 'text-amber' : 'text-muted hover:text-amber'
          }`}
        >
          {doc.starred ? '⭐' : '☆'}
        </button>
        <span className="text-xs text-accent font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          Chat →
        </span>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto ">

        {/* DOCUMENTS */}
        {activePage === 'documents' && (
          <div>
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl text-text-main mb-1">
                Documents
              </h1>
              <p className="text-muted font-body text-sm italic">
                Upload a PDF to start chatting with it
              </p>
            </div>

            <label className="block border-2 border-dashed border-white/7 rounded-xl p-10 text-center cursor-pointer hover:border-accent/40 transition-colors mb-6">
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
              />
              <p className="text-muted font-mono text-sm">
                {uploading ? status : '+ Drop a PDF here or click to upload'}
              </p>
              {status && !uploading && (
                <p className="text-accent font-mono text-xs mt-2">{status}</p>
              )}
            </label>

            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-muted font-mono text-sm text-center py-8">
                  No documents yet
                </p>
              ) : (
                documents.map(doc => <DocumentCard key={doc.id} doc={doc} />)
              )}
            </div>
          </div>
        )}

        {/* STARRED */}
        {activePage === 'starred' && (
          <div>
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl text-text-main mb-1">
                Starred
              </h1>
              <p className="text-muted font-body text-sm italic">
                Your bookmarked documents
              </p>
            </div>
            <div className="space-y-2">
              {documents.filter(d => d.starred).length === 0 ? (
                <p className="text-muted font-mono text-sm text-center py-8">
                  No starred documents — click ☆ on any document to star it
                </p>
              ) : (
                documents
                  .filter(d => d.starred)
                  .map(doc => <DocumentCard key={doc.id} doc={doc} />)
              )}
            </div>
          </div>
        )}

        {/* CHAT HISTORY */}
        {activePage === 'history' && (
          <div>
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl text-text-main mb-1">
                Chat History
              </h1>
              <p className="text-muted font-body text-sm italic">
                All your past conversations
              </p>
            </div>
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-muted font-mono text-sm text-center py-8">
                  No chat sessions yet
                </p>
              ) : (
                sessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setActiveDocument({
                        id: session.document_id,
                        filename: session.documents?.filename
                      })
                      setActiveSessionId(session.id)  
                      navigate('/chat')
                    }}
                    className="flex items-center justify-between p-4 border border-white/7 rounded-lg cursor-pointer hover:border-accent/30 hover:bg-surface2 transition-all group"
                  >
                    <div>
                      <p className="text-sm font-body text-text-main">
                        {session.documents?.filename || 'Unknown document'}
                      </p>
                      <p className="text-xs font-mono text-muted mt-0.5">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-accent font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      Resume →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activePage === 'settings' && (
          <div>
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl text-text-main mb-1">
                Settings
              </h1>
              <p className="text-muted font-body text-sm italic">
                Manage your account preferences
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-surface border border-white/7 rounded-lg p-5">
                <h2 className="font-mono text-xs text-muted uppercase tracking-widest mb-4">
                  Account
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="font-mono text-xs text-muted block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-surface2 border border-white/7 rounded-lg px-4 py-2 text-sm font-mono text-text-main outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-muted block mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-surface2 border border-white/7 rounded-lg px-4 py-2 text-sm font-mono text-text-main outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <button className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-mono hover:opacity-85 transition-opacity">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-surface border border-white/7 rounded-lg p-5">
                <h2 className="font-mono text-xs text-muted uppercase tracking-widest mb-4">
                  Danger Zone
                </h2>
                <button className="bg-coral/10 text-coral border border-coral/20 px-4 py-2 rounded-lg text-sm font-mono hover:bg-coral/20 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activePage === 'profile' && (
          <div>
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl text-text-main mb-1">
                Profile
              </h1>
              <p className="text-muted font-body text-sm italic">
                Your account information
              </p>
            </div>

            <div className="bg-surface border border-white/7 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/7">
                <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="font-display font-bold text-accent text-xl">U</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-text-main">Your Name</p>
                  <p className="font-mono text-xs text-muted">your@email.com</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="font-display font-bold text-2xl text-accent">
                    {documents.length}
                  </p>
                  <p className="font-mono text-xs text-muted uppercase tracking-wide">
                    Documents
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-2xl text-accent">
                    {documents.filter(d => d.starred).length}
                  </p>
                  <p className="font-mono text-xs text-muted uppercase tracking-wide">
                    Starred
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-2xl text-accent">
                    {sessions.length}
                  </p>
                  <p className="font-mono text-xs text-muted uppercase tracking-wide">
                    Chats
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
