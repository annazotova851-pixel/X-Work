import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Project } from '../types'

interface ProjectsContextType {
  projects: Project[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addProject: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: any; data?: Project }>
  updateProject: (projectId: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => Promise<{ success: boolean; error?: any; data?: Project }>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching projects:', fetchError)
        setError('Ошибка при загрузке проектов')
        return
      }

      setProjects(data || [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Неожиданная ошибка')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error: addError } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          status: 'active'
        }])
        .select()

      if (addError) {
        console.error('Error adding project:', addError)
        setError('Ошибка при добавлении проекта')
        return { success: false, error: addError }
      }

      if (data && data[0]) {
        setProjects(prev => [data[0], ...prev])
      }
      
      return { success: true, data: data?.[0] }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Неожиданная ошибка')
      return { success: false, error: err }
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()

      if (updateError) {
        console.error('Error updating project:', updateError)
        setError('Ошибка при обновлении проекта')
        return { success: false, error: updateError }
      }

      if (data && data[0]) {
        setProjects(prev => prev.map(p => p.id === projectId ? data[0] : p))
      }
      
      return { success: true, data: data?.[0] }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Неожиданная ошибка')
      return { success: false, error: err }
    }
  }

  return (
    <ProjectsContext.Provider value={{
      projects,
      loading,
      error,
      refetch: fetchProjects,
      addProject,
      updateProject
    }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}