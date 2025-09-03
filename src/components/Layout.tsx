import type { ReactNode } from 'react'
import { User, Building2, Calendar, Users, Settings, LogOut } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">X-Work Portal</h1>
        </div>
        
        <nav className="px-4 pb-6">
          <ul className="space-y-2">
            <li>
              <a href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Building2 className="w-5 h-5 mr-3" />
                Главная
              </a>
            </li>
            <li>
              <a href="/employees" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Users className="w-5 h-5 mr-3" />
                Сотрудники
              </a>
            </li>
            <li>
              <a href="/calendar" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 mr-3" />
                Календарь
              </a>
            </li>
            <li>
              <a href="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <User className="w-5 h-5 mr-3" />
                Профиль
              </a>
            </li>
            <li>
              <a href="/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
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