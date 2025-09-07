import { FolderOpen } from 'lucide-react'

export default function Projects() {
  return (
    <div className="p-12 flex items-center justify-center min-h-screen">
      <div className="text-center max-w-2xl">
        <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-200">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-500 rounded-2xl mb-6 shadow-lg">
              <FolderOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              Добро пожаловать в X-Work
            </h1>
            <div className="space-y-4">
              <p className="text-xl text-gray-600 font-medium">
                Система управления строительными проектами
              </p>
              <p className="text-gray-500 leading-relaxed">
                Откройте меню <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">"Проекты"</span> слева для навигации по объектам, редактирования и добавления новых проектов.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Управление проектами</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <span>Редактирование данных</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>Отчетность</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}