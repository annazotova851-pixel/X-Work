import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, ChevronDown, ChevronRight, Plus, Edit2, Check, X } from 'lucide-react'
import { useProjects } from '../contexts/ProjectsContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newProject, setNewProject] = useState({ name: '' })
  const { projects, loading: projectsLoading, updateProject, addProject } = useProjects()

  const handleEditStart = (project: any) => {
    setEditingId(project.id)
    setEditedName(project.name)
  }

  const handleEditSave = async () => {
    if (editingId && editedName.trim()) {
      try {
        await updateProject(editingId, { name: editedName.trim() })
        setEditingId(null)
        setEditedName('')
      } catch (error) {
        console.error('Error updating project:', error)
      }
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditedName('')
  }

  const handleAddNew = async () => {
    if (newProject.name.trim()) {
      try {
        // Автоматически генерируем код из названия
        const code = newProject.name.trim()
          .toUpperCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-А-Я]/g, '')
          .substring(0, 20)

        await addProject({
          name: newProject.name.trim(),
          code: code || 'PROJECT-' + Date.now(),
          status: 'active'
        })
        setIsAddingNew(false)
        setNewProject({ name: '' })
      } catch (error) {
        console.error('Error adding project:', error)
      }
    }
  }

  const handleAddCancel = () => {
    setIsAddingNew(false)
    setNewProject({ name: '' })
  }



  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-72 bg-white shadow-lg border-r border-gray-200">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-slate-600 to-slate-700">
          <h1 className="text-2xl font-bold text-white">
            X-Work Portal
          </h1>
          <p className="text-sm text-slate-200 mt-1">Система управления проектами</p>
        </div>
        
        <nav className="px-6 pb-8 pt-4">
          <ul className="space-y-3">
            <li>
              <div className="space-y-1">
                <button
                  onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-slate-50 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="p-2 bg-slate-500 rounded-lg mr-3 group-hover:bg-slate-600 transition-colors">
                    <FolderOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">Проекты</span>
                  <div className="ml-auto">
                    {isProjectsOpen ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>
                {isProjectsOpen && (
                  <div className="pl-4 space-y-2 mt-3">
                    {projectsLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Загрузка...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {projects.map((project) => (
                          <div key={project.id} className="flex items-center group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                            {editingId === project.id ? (
                              <div className="flex-1 flex items-center space-x-2 p-3">
                                <input
                                  type="text"
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white shadow-sm"
                                  autoFocus
                                />
                                <button
                                  onClick={handleEditSave}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <Link
                                  to={`/projects/${project.id}`}
                                  className="flex-1 px-4 py-3 text-sm text-gray-700 hover:text-slate-700 font-medium transition-colors"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                    <span>{project.name}</span>
                                  </div>
                                </Link>
                                <button
                                  onClick={() => handleEditStart(project)}
                                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 mr-2"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                        
                        {isAddingNew ? (
                          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 space-y-3">
                            <input
                              type="text"
                              placeholder="Название проекта"
                              value={newProject.name}
                              onChange={(e) => setNewProject({ name: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white shadow-sm"
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={handleAddNew}
                                disabled={!newProject.name.trim()}
                                className="flex-1 px-3 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                              >
                                Добавить
                              </button>
                              <button
                                onClick={handleAddCancel}
                                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingNew(true)}
                            className="w-full px-4 py-3 text-sm text-slate-600 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center group shadow-sm border border-slate-200"
                          >
                            <div className="p-1 bg-slate-500 rounded-lg mr-2 group-hover:bg-slate-600 transition-colors">
                              <Plus className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-medium">Добавить проект</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </aside>
      
      <main className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}