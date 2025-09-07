import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Save, X, Plus, Trash2 } from 'lucide-react'
import { useProjects } from '../contexts/ProjectsContext'
import { supabase } from '../lib/supabase'
import type { Project } from '../types'

interface ProjectParameter {
  id: string
  parameter: string
  value: string
  sort_order: number
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { projects } = useProjects()
  const [project, setProject] = useState<Project | null>(null)
  const [projectData, setProjectData] = useState<ProjectParameter[]>([])
  const [loading, setLoading] = useState(true)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingData, setEditingData] = useState({ parameter: '', value: '' })
  const [isAddingNew, setIsAddingNew] = useState(false)

  useEffect(() => {
    if (id && projects.length > 0) {
      const foundProject = projects.find(p => p.id === id)
      setProject(foundProject || null)
      if (foundProject) {
        loadProjectParameters(foundProject.id)
      }
    }
  }, [id, projects])

  const loadProjectParameters = async (projectId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_parameters')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order')
      
      if (error) throw error
      setProjectData(data || [])
    } catch (error) {
      console.error('Error loading project parameters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditingData({ ...projectData[index] })
  }

  const handleSave = async (index: number) => {
    if (!project) return
    
    try {
      const parameterToUpdate = projectData[index]
      const { error } = await supabase
        .from('project_parameters')
        .update({
          parameter: editingData.parameter,
          value: editingData.value
        })
        .eq('id', parameterToUpdate.id)
      
      if (error) throw error
      
      const newData = [...projectData]
      newData[index] = { ...parameterToUpdate, ...editingData }
      setProjectData(newData)
      setEditingIndex(null)
      setEditingData({ parameter: '', value: '' })
    } catch (error) {
      console.error('Error updating parameter:', error)
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditingData({ parameter: '', value: '' })
  }

  const handleAddNew = async () => {
    if (!project || !editingData.parameter.trim() || !editingData.value.trim()) return
    
    try {
      const maxSortOrder = Math.max(...projectData.map(p => p.sort_order), 0)
      const { data, error } = await supabase
        .from('project_parameters')
        .insert({
          project_id: project.id,
          parameter: editingData.parameter.trim(),
          value: editingData.value.trim(),
          sort_order: maxSortOrder + 1
        })
        .select()
        .single()
      
      if (error) throw error
      
      setProjectData([...projectData, data])
      setEditingData({ parameter: '', value: '' })
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error adding parameter:', error)
    }
  }

  const handleDelete = async (index: number) => {
    const parameterToDelete = projectData[index]
    
    try {
      const { error } = await supabase
        .from('project_parameters')
        .delete()
        .eq('id', parameterToDelete.id)
      
      if (error) throw error
      
      const newData = projectData.filter((_, i) => i !== index)
      setProjectData(newData)
    } catch (error) {
      console.error('Error deleting parameter:', error)
    }
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Проект не найден</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-slate-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к проектам
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
      </div>


      {/* Сводная информация */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100">
        <div className="p-6 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Сводная информация</h2>
            {!isAddingNew && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить параметр
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Загрузка параметров...</span>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Заголовки столбцов */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg font-semibold text-gray-700">
                <div className="col-span-5">Параметр</div>
                <div className="col-span-5">Значение</div>
                <div className="col-span-2 text-center">Действия</div>
              </div>

              {/* Строки данных */}
              {projectData.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 group">
                {editingIndex === index ? (
                  <>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={editingData.parameter}
                        onChange={(e) => setEditingData({ ...editingData, parameter: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        autoFocus
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={editingData.value}
                        onChange={(e) => setEditingData({ ...editingData, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleSave(index)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-5 py-2 font-medium text-gray-700">{item.parameter}</div>
                    <div className="col-span-5 py-2 text-gray-600">{item.value}</div>
                    <div className="col-span-2 flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(index)}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              ))}

              {/* Форма добавления нового параметра */}
              {isAddingNew && (
                <div className="grid grid-cols-12 gap-4 p-3 bg-blue-50 rounded-lg border-2 border-gray-200">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Название параметра"
                      value={editingData.parameter}
                      onChange={(e) => setEditingData({ ...editingData, parameter: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      autoFocus
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Значение параметра"
                      value={editingData.value}
                      onChange={(e) => setEditingData({ ...editingData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center space-x-1">
                    <button
                      onClick={handleAddNew}
                      disabled={!editingData.parameter.trim() || !editingData.value.trim()}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingNew(false)
                        setEditingData({ parameter: '', value: '' })
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}