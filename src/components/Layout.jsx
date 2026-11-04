import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useDocuMind from '../store/useDocumind'
import useAuth from '../store/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileLines,
  faStar,
  faClockRotateLeft,
  faGear,
  faUser,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

const navItems = [
  { id: 'documents', label: 'Documents',    icon: faFileLines },
  { id: 'starred',   label: 'Starred',      icon: faStar },
  { id: 'history',   label: 'Chat History', icon: faClockRotateLeft },
]

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: faGear },
  { id: 'profile',  label: 'Profile',  icon: faUser },
]

function Sidebar({ activePage, onNav, onClose, user, signOut }) {
  return (
    <aside className="w-56 flex flex-col bg-sidebar border-r border-white/[0.06] h-full">
      <div className="px-4 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <span className="font-display font-bold text-base tracking-tight select-none">
          <span className="text-text-main">Docu</span><span className="text-accent">Mind</span>
        </span>
        <button
          onClick={onClose}
          className="md:hidden text-muted hover:text-text-main transition-colors p-1"
          aria-label="Close menu"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-px overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activePage === item.id
                ? 'text-text-main bg-surface2 font-medium'
                : 'text-text-sub hover:text-text-main hover:bg-white/[0.04]'
            }`}
          >
            <FontAwesomeIcon
              icon={item.icon}
              className={`w-3.5 flex-shrink-0 ${activePage === item.id ? 'text-accent' : ''}`}
            />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-white/[0.06] space-y-px">
        {bottomItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activePage === item.id
                ? 'text-text-main bg-surface2 font-medium'
                : 'text-text-sub hover:text-text-main hover:bg-white/[0.04]'
            }`}
          >
            <FontAwesomeIcon
              icon={item.icon}
              className={`w-3.5 flex-shrink-0 ${activePage === item.id ? 'text-accent' : ''}`}
            />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="px-2 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1 min-w-0">
          <div className="w-6 h-6 rounded-md bg-surface2 flex items-center justify-center flex-shrink-0">
            <span className="text-text-sub text-xs font-semibold">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
          <p className="text-xs text-muted truncate min-w-0">{user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-coral hover:bg-white/[0.04] transition-colors"
        >
          <span className="text-xs flex-shrink-0">↪</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

export default function Layout({ children }) {
  const { activePage, setActivePage } = useDocuMind()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNav = useCallback((id) => {
    setActivePage(id)
    navigate('/')
    setSidebarOpen(false)
  }, [setActivePage, navigate])

  const handleClose = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="flex h-screen bg-bg overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          activePage={activePage}
          onNav={handleNav}
          onClose={handleClose}
          user={user}
          signOut={signOut}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
          />
          <div className="absolute left-0 top-0 h-full z-50">
            <Sidebar
              activePage={activePage}
              onNav={handleNav}
              onClose={handleClose}
              user={user}
              signOut={signOut}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted hover:text-text-main transition-colors p-1 -ml-1"
            aria-label="Open menu"
          >
            <FontAwesomeIcon icon={faBars} className="text-base" />
          </button>
          <span className="font-display font-bold text-sm tracking-tight select-none">
            <span className="text-text-main">Docu</span><span className="text-accent">Mind</span>
          </span>
        </div>

        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>

    </div>
  )
}
