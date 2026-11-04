import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import useDocuMind from '../store/useDocumind'
import useAuth from '../store/useAuth'
import {
  uploadDocument,
  getDocuments,
  toggleStar,
  getSessions,
  deleteDocument,
  deleteSession
} from '../api/documind'

function ConfirmModal({ confirmDelete, onCancel, onConfirm }) {
  if (!confirmDelete) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-sm">
        <h3 className="font-display font-semibold text-text-main mb-2">Are you sure?</h3>
        <p className="text-text-sub text-sm mb-6 break-words">
          Delete <span className="text-text-main">&quot;{confirmDelete.name}&quot;</span>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-muted hover:text-text-main border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm bg-coral/90 text-white hover:bg-coral transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ doc, onOpen, onStar, onDelete, openMenuId, setOpenMenuId }) {
  return (
    <div
      onClick={() => onOpen(doc)}
      className="flex items-center justify-between px-4 py-3 border border-white/[0.07] rounded-lg cursor-pointer hover:bg-surface2 hover:border-white/[0.12] transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-[10px] font-semibold text-muted bg-surface2 border border-white/[0.07] px-1.5 py-0.5 rounded flex-shrink-0">
          PDF
        </span>
        <span className="text-sm text-text-main truncate">{doc.filename}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3" onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); onStar(e, doc) }}
          className={`text-sm transition-colors flex-shrink-0 ${doc.starred ? 'text-amber' : 'text-muted hover:text-amber'}`}
        >
          {doc.starred ? '★' : '☆'}
        </button>
        <div className="relative" onMouseLeave={() => setOpenMenuId(null)}>
          <button
            onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
            className="text-muted hover:text-text-main w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors text-base leading-none"
          >
            ···
          </button>
          {openMenuId === doc.id && (
            <div className="absolute right-0 top-8 bg-surface border border-white/[0.1] rounded-lg shadow-xl z-10 w-32 py-1 overflow-hidden">
              <button
                onClick={() => { onOpen(doc); setOpenMenuId(null) }}
                className="w-full text-left px-3 py-2 text-sm text-text-sub hover:text-text-main hover:bg-white/[0.04] transition-colors"
              >
                Chat
              </button>
              <button
                onClick={() => { onStar(null, doc); setOpenMenuId(null) }}
                className="w-full text-left px-3 py-2 text-sm text-text-sub hover:text-text-main hover:bg-white/[0.04] transition-colors"
              >
                {doc.starred ? 'Unstar' : 'Star'}
              </button>
              <div className="border-t border-white/[0.06] my-1" />
              <button
                onClick={() => { onDelete(doc); setOpenMenuId(null) }}
                className="w-full text-left px-3 py-2 text-sm text-coral hover:bg-white/[0.04] transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const sectionHeading = (title, sub) => (
  <div className="mb-5">
    <h1 className="font-display font-semibold text-xl text-text-main mb-0.5">{title}</h1>
    <p className="text-text-sub text-sm">{sub}</p>
  </div>
)

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    documents,
    activePage,
    setDocuments,
    addDocument,
    setActiveDocument,
    toggleStarred,
    setActiveSessionId,
    removeDocument
  } = useDocuMind()

  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const [sessions, setSessions] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    const load = async () => {
      const result = await getDocuments()
      if (result.documents) setDocuments(result.documents)
      const s = await getSessions()
      if (s.sessions) setSessions(s.sessions)
    }
    load()
  }, [setDocuments])

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 25 * 1024 * 1024) { setStatus('File too large. Maximum 25MB.'); return }
    setUploading(true)
    setStatus('Uploading...')
    try {
      const result = await uploadDocument(file)
      addDocument({ id: result.document_id, filename: file.name, starred: false })
      if (result.pii_detected && Object.keys(result.pii_detected).length > 0) {
        setStatus(`Ready ✓ — PII masked: ${Object.keys(result.pii_detected).join(', ')}`)
      } else {
        setStatus('Ready ✓')
      }
    } catch (error) {
      setStatus(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [addDocument])

  const openDocument = useCallback((doc) => {
    setActiveDocument(doc)
    navigate('/chat')
  }, [setActiveDocument, navigate])

  const handleStar = useCallback(async (e, doc) => {
    if (e) e.stopPropagation()
    toggleStarred(doc.id)
    await toggleStar(doc.id, !doc.starred)
  }, [toggleStarred])

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return
    if (confirmDelete.type === 'doc') {
      await deleteDocument(confirmDelete.id)
      removeDocument(confirmDelete.id)
    } else {
      await deleteSession(confirmDelete.id)
      setSessions(prev => prev.filter(s => s.id !== confirmDelete.id))
    }
    setConfirmDelete(null)
  }, [confirmDelete, removeDocument])

  const handleDeleteDoc = useCallback((doc) => {
    setConfirmDelete({ type: 'doc', id: doc.id, name: doc.filename })
  }, [])

  return (
    <Layout>
      <ConfirmModal
        confirmDelete={confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />

      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">

        {/* DOCUMENTS */}
        {activePage === 'documents' && (
          <div>
            {sectionHeading('Documents', 'Upload a PDF to start chatting with it')}

            <label className="block border border-dashed border-white/[0.1] rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors mb-5 group">
              <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
              <p className="text-text-sub text-sm group-hover:text-text-main transition-colors">
                {uploading ? status : '+ Drop a PDF or click to upload'}
              </p>
              {status && !uploading && (
                <p className="text-emerald text-xs mt-2 break-words">{status}</p>
              )}
            </label>

            <div className="space-y-1.5">
              {documents.length === 0 ? (
                <p className="text-muted text-sm text-center py-8">No documents yet</p>
              ) : (
                documents.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onOpen={openDocument}
                    onStar={handleStar}
                    onDelete={handleDeleteDoc}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* STARRED */}
        {activePage === 'starred' && (
          <div>
            {sectionHeading('Starred', 'Your bookmarked documents')}
            <div className="space-y-1.5">
              {documents.filter(d => d.starred).length === 0 ? (
                <p className="text-muted text-sm text-center py-8">No starred documents yet</p>
              ) : (
                documents.filter(d => d.starred).map(doc => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onOpen={openDocument}
                    onStar={handleStar}
                    onDelete={handleDeleteDoc}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activePage === 'history' && (
          <div>
            {sectionHeading('Chat History', 'All your past conversations')}
            <div className="space-y-1.5">
              {sessions.length === 0 ? (
                <p className="text-muted text-sm text-center py-8">No chat sessions yet</p>
              ) : (
                sessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setActiveDocument({ id: session.document_id, filename: session.documents?.filename })
                      setActiveSessionId(session.id)
                      navigate('/chat')
                    }}
                    className="flex items-center justify-between px-4 py-3 border border-white/[0.07] rounded-lg cursor-pointer hover:bg-surface2 hover:border-white/[0.12] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-main truncate">
                        {session.documents?.filename || 'Unknown document'}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-3" onClick={e => e.stopPropagation()}>
                      <div className="relative" onMouseLeave={() => setOpenMenuId(null)}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === session.id ? null : session.id)}
                          className="text-muted hover:text-text-main w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors text-base leading-none"
                        >···</button>
                        {openMenuId === session.id && (
                          <div className="absolute right-0 top-8 bg-surface border border-white/[0.1] rounded-lg shadow-xl z-10 w-32 py-1 overflow-hidden">
                            <button
                              onClick={() => {
                                setActiveDocument({ id: session.document_id, filename: session.documents?.filename })
                                setActiveSessionId(session.id)
                                navigate('/chat')
                                setOpenMenuId(null)
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-text-sub hover:text-text-main hover:bg-white/[0.04] transition-colors"
                            >Resume</button>
                            <div className="border-t border-white/[0.06] my-1" />
                            <button
                              onClick={() => {
                                setConfirmDelete({ type: 'session', id: session.id, name: session.documents?.filename || 'this chat' })
                                setOpenMenuId(null)
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-coral hover:bg-white/[0.04] transition-colors"
                            >Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activePage === 'settings' && (
          <div>
            {sectionHeading('Settings', 'Manage your account preferences')}
            <div className="space-y-3">
              <div className="bg-surface border border-white/[0.07] rounded-lg p-5">
                <h2 className="text-xs text-muted uppercase tracking-widest mb-4">Account</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-text-sub block mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-surface2 border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-white/20 transition-colors placeholder:text-muted"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-sub block mb-1.5">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-surface2 border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-white/20 transition-colors placeholder:text-muted"
                    />
                  </div>
                  <button className="bg-text-main text-bg px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
              <div className="bg-surface border border-white/[0.07] rounded-lg p-5">
                <h2 className="text-xs text-muted uppercase tracking-widest mb-4">Danger Zone</h2>
                <button className="text-coral border border-coral/20 bg-coral/5 px-4 py-2 rounded-lg text-sm hover:bg-coral/10 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activePage === 'profile' && (
          <div>
            {sectionHeading('Profile', 'Your account information')}
            <div className="bg-surface border border-white/[0.07] rounded-lg p-5">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.07] min-w-0">
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-text-sub text-sm">{user?.email?.[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-text-main text-sm truncate">{user?.email}</p>
                  <p className="text-xs text-muted">Free plan</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface2 rounded-lg p-4 text-center">
                  <p className="font-display font-bold text-xl text-text-main">{documents.length}</p>
                  <p className="text-xs text-muted uppercase tracking-wide mt-1">Docs</p>
                </div>
                <div className="bg-surface2 rounded-lg p-4 text-center">
                  <p className="font-display font-bold text-xl text-amber">{documents.filter(d => d.starred).length}</p>
                  <p className="text-xs text-muted uppercase tracking-wide mt-1">Starred</p>
                </div>
                <div className="bg-surface2 rounded-lg p-4 text-center">
                  <p className="font-display font-bold text-xl text-text-main">{sessions.length}</p>
                  <p className="text-xs text-muted uppercase tracking-wide mt-1">Chats</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
