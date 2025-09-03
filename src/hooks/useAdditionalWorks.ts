import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AdditionalWork } from '../types'

export function useAdditionalWorks() {
  const [works, setWorks] = useState<AdditionalWork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorks = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('additional_works')
        .select(`
          *,
          unit:units(*)
        `)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('Ошибка загрузки дополнительных работ:', supabaseError)
        setError('Не удалось загрузить дополнительные работы')
        return
      }

      setWorks(data || [])
    } catch (error) {
      console.error('Ошибка загрузки дополнительных работ:', error)
      setError('Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  const addWork = async (workData: Omit<AdditionalWork, 'id' | 'created_at' | 'updated_at' | 'unit'>) => {
    try {
      const { data, error } = await supabase
        .from('additional_works')
        .insert([workData])
        .select(`
          *,
          unit:units(*)
        `)

      if (error) {
        console.error('Ошибка добавления дополнительной работы:', error)
        throw new Error('Не удалось добавить дополнительную работу')
      }

      if (data) {
        setWorks(prev => [...data, ...prev])
        return data[0]
      }
    } catch (error) {
      console.error('Ошибка добавления дополнительной работы:', error)
      throw error
    }
  }

  const updateWork = async (id: string, updates: Partial<AdditionalWork>) => {
    try {
      const { error } = await supabase
        .from('additional_works')
        .update(updates)
        .eq('id', id)

      if (error) {
        console.error('Ошибка обновления дополнительной работы:', error)
        throw new Error('Не удалось обновить дополнительную работу')
      }

      setWorks(prev => 
        prev.map(work => 
          work.id === id ? { ...work, ...updates } : work
        )
      )
    } catch (error) {
      console.error('Ошибка обновления дополнительной работы:', error)
      throw error
    }
  }

  const deleteWork = async (id: string) => {
    try {
      const { error } = await supabase
        .from('additional_works')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Ошибка удаления дополнительной работы:', error)
        throw new Error('Не удалось удалить дополнительную работу')
      }

      setWorks(prev => prev.filter(work => work.id !== id))
    } catch (error) {
      console.error('Ошибка удаления дополнительной работы:', error)
      throw error
    }
  }

  const getWorksByStatus = (status: AdditionalWork['status']) => {
    return works.filter(work => work.status === status)
  }

  const getWorksWithDeviations = () => {
    return works.filter(work => work.quantity_pd !== work.quantity_recount)
  }

  const calculateTotalDeviation = () => {
    return works.reduce((total, work) => {
      const deviation = work.quantity_recount - work.quantity_pd
      return total + Math.abs(deviation)
    }, 0)
  }

  useEffect(() => {
    loadWorks()
  }, [])

  return {
    works,
    loading,
    error,
    addWork,
    updateWork,
    deleteWork,
    getWorksByStatus,
    getWorksWithDeviations,
    calculateTotalDeviation,
    refetch: loadWorks
  }
}