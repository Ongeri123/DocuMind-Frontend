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
  faFileCircleCheck,
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

export default function Layout({ children }) {
  const { activePage, setActivePage } = useDocuMind()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleNav = (id) => {
    setActivePage(id)
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">

      <aside className="w-64 flex flex-col bg-sidebar border-r border-white/7 flex-shrink-0">

        <div className="p-5 border-b border-white/7 flex items-center gap-2">
          <FontAwesomeIcon icon={faFileCircleCheck} className="text-accent text-lg" />
          <span className="font-display font-bold text-white text-lg">DocuMind</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors ${
                activePage === item.id
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-slate-300 hover:text-white hover:bg-sidebar-hover'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/7 space-y-1">
          {bottomItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors ${
                activePage === item.id
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-slate-300 hover:text-white hover:bg-sidebar-hover'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              {item.label}
            </button>
          ))}
        </div>
          <div className="p-3 border-t border-white/20">
          <div className="px-3 py-2 mb-2">
            <p className="font-mono text-xs text-white/60 truncate">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
          <span>🚪</span>
            Sign Out
          </button>
       </div>

      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}