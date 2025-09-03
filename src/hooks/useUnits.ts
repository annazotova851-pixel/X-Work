import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Unit } from '../types'

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUnits = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('units')
        .select('*')
        .order('name')

      if (supabaseError) {
        console.error('Ошибка загрузки единиц измерения:', supabaseError)
        setError('Не удалось загрузить единицы измерения')
        return
      }

      setUnits(data || [])
    } catch (error) {
      console.error('Ошибка загрузки единиц измерения:', error)
      setError('Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  const addUnit = async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert([unitData])
        .select()

      if (error) {
        console.error('Ошибка добавления единицы измерения:', error)
        throw new Error('Не удалось добавить единицу измерения')
      }

      if (data) {
        setUnits(prev => [...prev, ...data])
        return data[0]
      }
    } catch (error) {
      console.error('Ошибка добавления единицы измерения:', error)
      throw error
    }
  }

  const updateUnit = async (id: string, updates: Partial<Unit>) => {
    try {
      const { error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', id)

      if (error) {
        console.error('Ошибка обновления единицы измерения:', error)
        throw new Error('Не удалось обновить единицу измерения')
      }

      setUnits(prev => 
        prev.map(unit => 
          unit.id === id ? { ...unit, ...updates } : unit
        )
      )
    } catch (error) {
      console.error('Ошибка обновления единицы измерения:', error)
      throw error
    }
  }

  const deleteUnit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Ошибка удаления единицы измерения:', error)
        throw new Error('Не удалось удалить единицу измерения')
      }

      setUnits(prev => prev.filter(unit => unit.id !== id))
    } catch (error) {
      console.error('Ошибка удаления единицы измерения:', error)
      throw error
    }
  }

  const getActiveUnits = () => {
    return units.filter(unit => unit.is_active)
  }

  useEffect(() => {
    loadUnits()
  }, [])

  return {
    units,
    loading,
    error,
    addUnit,
    updateUnit,
    deleteUnit,
    getActiveUnits,
    refetch: loadUnits
  }
}