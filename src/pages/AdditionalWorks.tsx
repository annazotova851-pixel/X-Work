import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { AdditionalWork, Unit } from '../types'

export default function AdditionalWorks() {
  const [works, setWorks] = useState<AdditionalWork[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    materials: '',
    quantity_pd: 0,
    quantity_recount: 0,
    unit_id: '',
    status: 'draft' as const
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [worksResult, unitsResult] = await Promise.all([
        supabase
          .from('additional_works')
          .select(`
            *,
            unit:units(*)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('units')
          .select('*')
          .eq('is_active', true)
          .order('name')
      ])

      if (worksResult.error) {
        console.error('Ошибка загрузки дополнительных работ:', worksResult.error)
      } else {
        setWorks(worksResult.data || [])
      }

      if (unitsResult.error) {
        console.error('Ошибка загрузки единиц измерения:', unitsResult.error)
      } else {
        setUnits(unitsResult.data || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const { data, error } = await supabase
        .from('additional_works')
        .insert([formData])
        .select(`
          *,
          unit:units(*)
        `)

      if (error) {
        console.error('Ошибка добавления дополнительной работы:', error)
        return
      }

      if (data) {
        setWorks([...data, ...works])
        setFormData({
          materials: '',
          quantity_pd: 0,
          quantity_recount: 0,
          unit_id: '',
          status: 'draft'
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Ошибка добавления дополнительной работы:', error)
    }
  }

  const handleEdit = async (id: string, updatedData: Partial<AdditionalWork>) => {
    try {
      const { error } = await supabase
        .from('additional_works')
        .update(updatedData)
        .eq('id', id)

      if (error) {
        console.error('Ошибка обновления дополнительной работы:', error)
        return
      }

      setWorks(works.map(work => 
        work.id === id ? { ...work, ...updatedData } : work
      ))
      setEditingId(null)
    } catch (error) {
      console.error('Ошибка обновления дополнительной работы:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту дополнительную работу?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('additional_works')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Ошибка удаления дополнительной работы:', error)
        return
      }

      setWorks(works.filter(work => work.id !== id))
    } catch (error) {
      console.error('Ошибка удаления дополнительной работы:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Дополнительные работы</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить работу
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {showAddForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Материалы"
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Кол-во по ПД"
                step="0.001"
                value={formData.quantity_pd}
                onChange={(e) => setFormData({ ...formData, quantity_pd: parseFloat(e.target.value) || 0 })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Кол-во по пересчету"
                step="0.001"
                value={formData.quantity_recount}
                onChange={(e) => setFormData({ ...formData, quantity_recount: parseFloat(e.target.value) || 0 })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите ед.изм.</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.short_name || unit.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!formData.materials || !formData.unit_id}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Материалы
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Кол-во по ПД
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Кол-во по пересчету
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Отклонение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ед.Изм.
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
              {works.map((work) => (
                <WorkRow
                  key={work.id}
                  work={work}
                  units={units}
                  isEditing={editingId === work.id}
                  onEdit={() => setEditingId(work.id)}
                  onSave={(updatedData) => handleEdit(work.id, updatedData)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(work.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {works.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Дополнительные работы не найдены
          </div>
        )}
      </div>
    </div>
  )
}

interface WorkRowProps {
  work: AdditionalWork
  units: Unit[]
  isEditing: boolean
  onEdit: () => void
  onSave: (data: Partial<AdditionalWork>) => void
  onCancel: () => void
  onDelete: () => void
}

function WorkRow({ work, units, isEditing, onEdit, onSave, onCancel, onDelete }: WorkRowProps) {
  const [editData, setEditData] = useState({
    materials: work.materials,
    quantity_pd: work.quantity_pd,
    quantity_recount: work.quantity_recount,
    unit_id: work.unit_id,
    status: work.status
  })

  const handleSave = () => {
    onSave(editData)
  }

  const deviation = work.quantity_recount - work.quantity_pd
  const deviationPercent = work.quantity_pd !== 0 ? ((deviation / work.quantity_pd) * 100) : 0

  if (isEditing) {
    return (
      <tr>
        <td className="px-6 py-4">
          <input
            type="text"
            value={editData.materials}
            onChange={(e) => setEditData({ ...editData, materials: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            step="0.001"
            value={editData.quantity_pd}
            onChange={(e) => setEditData({ ...editData, quantity_pd: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            step="0.001"
            value={editData.quantity_recount}
            onChange={(e) => setEditData({ ...editData, quantity_recount: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {(editData.quantity_recount - editData.quantity_pd).toFixed(3)}
        </td>
        <td className="px-6 py-4">
          <select
            value={editData.unit_id}
            onChange={(e) => setEditData({ ...editData, unit_id: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.short_name || unit.name}
              </option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4">
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value as AdditionalWork['status'] })}
            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Черновик</option>
            <option value="approved">Утвержден</option>
            <option value="rejected">Отклонен</option>
          </select>
        </td>
        <td className="px-6 py-4">
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
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {work.materials}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {work.quantity_pd.toFixed(3)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {work.quantity_recount.toFixed(3)}
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="flex flex-col">
          <span className={deviation !== 0 ? (deviation > 0 ? 'text-red-600' : 'text-blue-600') : 'text-gray-500'}>
            {deviation > 0 ? '+' : ''}{deviation.toFixed(3)}
          </span>
          {deviation !== 0 && (
            <span className={`text-xs ${deviation > 0 ? 'text-red-500' : 'text-blue-500'}`}>
              {deviationPercent > 0 ? '+' : ''}{deviationPercent.toFixed(1)}%
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {work.unit?.short_name || work.unit?.name || '—'}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          work.status === 'approved'
            ? 'bg-green-100 text-green-800'
            : work.status === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {work.status === 'approved' ? 'Утвержден' : 
           work.status === 'rejected' ? 'Отклонен' : 'Черновик'}
        </span>
      </td>
      <td className="px-6 py-4">
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