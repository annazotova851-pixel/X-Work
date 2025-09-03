import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Unit } from '../types'

export default function References() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    short_name: '',
    is_active: true
  })

  useEffect(() => {
    loadUnits()
  }, [])

  const loadUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name')

      if (error) {
        console.error('Ошибка загрузки единиц измерения:', error)
        return
      }

      setUnits(data || [])
    } catch (error) {
      console.error('Ошибка загрузки единиц измерения:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert([formData])
        .select()

      if (error) {
        console.error('Ошибка добавления единицы измерения:', error)
        return
      }

      if (data) {
        setUnits([...units, ...data])
        setFormData({ code: '', name: '', short_name: '', is_active: true })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Ошибка добавления единицы измерения:', error)
    }
  }

  const handleEdit = async (id: string, updatedData: Partial<Unit>) => {
    try {
      const { error } = await supabase
        .from('units')
        .update(updatedData)
        .eq('id', id)

      if (error) {
        console.error('Ошибка обновления единицы измерения:', error)
        return
      }

      setUnits(units.map(unit => 
        unit.id === id ? { ...unit, ...updatedData } : unit
      ))
      setEditingId(null)
    } catch (error) {
      console.error('Ошибка обновления единицы измерения:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту единицу измерения?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Ошибка удаления единицы измерения:', error)
        return
      }

      setUnits(units.filter(unit => unit.id !== id))
    } catch (error) {
      console.error('Ошибка удаления единицы измерения:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Справочники</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Единицы измерения</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Код"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Наименование"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Краткое наименование"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdd}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Код
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Наименование
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Краткое наименование
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {units.map((unit) => (
                <UnitRow
                  key={unit.id}
                  unit={unit}
                  isEditing={editingId === unit.id}
                  onEdit={() => setEditingId(unit.id)}
                  onSave={(updatedData) => handleEdit(unit.id, updatedData)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(unit.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {units.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Единицы измерения не найдены
          </div>
        )}
      </div>
    </div>
  )
}

interface UnitRowProps {
  unit: Unit
  isEditing: boolean
  onEdit: () => void
  onSave: (data: Partial<Unit>) => void
  onCancel: () => void
  onDelete: () => void
}

function UnitRow({ unit, isEditing, onEdit, onSave, onCancel, onDelete }: UnitRowProps) {
  const [editData, setEditData] = useState({
    code: unit.code,
    name: unit.name,
    short_name: unit.short_name || '',
    is_active: unit.is_active
  })

  const handleSave = () => {
    onSave(editData)
  }

  if (isEditing) {
    return (
      <tr>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="text"
            value={editData.code}
            onChange={(e) => setEditData({ ...editData, code: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="text"
            value={editData.short_name}
            onChange={(e) => setEditData({ ...editData, short_name: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={editData.is_active ? 'true' : 'false'}
            onChange={(e) => setEditData({ ...editData, is_active: e.target.value === 'true' })}
            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="true">Активный</option>
            <option value="false">Неактивный</option>
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {unit.code}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {unit.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {unit.short_name || '—'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          unit.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {unit.is_active ? 'Активный' : 'Неактивный'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}