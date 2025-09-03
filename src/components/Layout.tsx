import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, Building2, Calendar, Users, Settings, LogOut, Briefcase, BookOpen } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const getLinkClasses = (path: string) => {
    const baseClasses = "flex items-center px-4 py-2 rounded-lg transition-colors"
    const activeClasses = "bg-blue-100 text-blue-700"
    const inactiveClasses = "text-gray-700 hover:bg-gray-100"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">X-Work Portal</h1>
        </div>
        
        <nav className="px-4 pb-6">
          <ul className="space-y-2">
            <li>
              <Link to="/" className={getLinkClasses('/')}>
                <Building2 className="w-5 h-5 mr-3" />
                Дашборд
              </Link>
            </li>
            <li>
              <Link to="/additional-works" className={getLinkClasses('/additional-works')}>
                <Briefcase className="w-5 h-5 mr-3" />
                Доп.работы
              </Link>
            </li>
            <li>
              <Link to="/references" className={getLinkClasses('/references')}>
                <BookOpen className="w-5 h-5 mr-3" />
                Справочники
              </Link>
            </li>
            <li>
              <a href="/employees" className={getLinkClasses('/employees')}>
                <Users className="w-5 h-5 mr-3" />
                Сотрудники
              </a>
            </li>
            <li>
              <a href="/calendar" className={getLinkClasses('/calendar')}>
                <Calendar className="w-5 h-5 mr-3" />
                Календарь
              </a>
            </li>
            <li>
              <a href="/profile" className={getLinkClasses('/profile')}>
                <User className="w-5 h-5 mr-3" />
                Профиль
              </a>
            </li>
            <li>
              <a href="/settings" className={getLinkClasses('/settings')}>
                <Settings className="w-5 h-5 mr-3" />
                Настройки
              </a>
            </li>
          </ul>
          
          <div className="mt-8">
            <button className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full">
              <LogOut className="w-5 h-5 mr-3" />
              Выход
            </button>
          </div>
        </nav>
      </aside>
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}