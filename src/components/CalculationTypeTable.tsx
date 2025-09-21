import React, { useState, useEffect } from 'react'
import { Table, Input, Button, Typography, App } from 'antd'
import { PlusOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography

interface CalculationTypeItem {
  key: string
  id: number
  name: string
}

const CalculationTypeTable: React.FC = () => {
  const { message } = App.useApp()
  const [calculationTypes, setCalculationTypes] = useState<CalculationTypeItem[]>([])
  const [editingKey, setEditingKey] = useState<string>('')
  const [editingValue, setEditingValue] = useState<string>('')
  const [editingColumnHeader, setEditingColumnHeader] = useState<boolean>(false)
  const [columnHeaderValue, setColumnHeaderValue] = useState<string>('')
  const [columnTitle, setColumnTitle] = useState<string>('Наименование типа расчета')

  // Загрузка типов расчета из localStorage
  useEffect(() => {
    const savedCalculationTypes = localStorage.getItem('calculationTypes')
    if (savedCalculationTypes) {
      try {
        const parsedCalculationTypes = JSON.parse(savedCalculationTypes)
        setCalculationTypes(parsedCalculationTypes)
      } catch (error) {
        console.error('Ошибка загрузки типов расчета:', error)
      }
    } else {
      // Начальные данные
      const initialCalculationTypes = [
        { key: '1', id: 1, name: 'Тип расчета 1' },
        { key: '2', id: 2, name: 'Тип расчета 2' },
        { key: '3', id: 3, name: 'Тип расчета 3' }
      ]
      setCalculationTypes(initialCalculationTypes)
      saveCalculationTypes(initialCalculationTypes)
    }

    // Загрузка заголовка столбца
    const savedColumnTitle = localStorage.getItem('calculationTypesColumnTitle')
    if (savedColumnTitle) {
      setColumnTitle(savedColumnTitle)
    }
  }, [])

  // Сохранение типов расчета в localStorage
  const saveCalculationTypes = (calculationTypesToSave: CalculationTypeItem[]) => {
    try {
      localStorage.setItem('calculationTypes', JSON.stringify(calculationTypesToSave))
    } catch (error) {
      console.error('Ошибка сохранения типов расчета:', error)
    }
  }

  // Начать редактирование
  const startEdit = (key: string, name: string) => {
    setEditingKey(key)
    setEditingValue(name)
  }

  // Сохранить изменения
  const saveEdit = () => {
    if (editingValue.trim()) {
      const updatedCalculationTypes = calculationTypes.map(calculationType => 
        calculationType.key === editingKey 
          ? { ...calculationType, name: editingValue.trim() }
          : calculationType
      )
      setCalculationTypes(updatedCalculationTypes)
      saveCalculationTypes(updatedCalculationTypes)
      setEditingKey('')
      setEditingValue('')
      message.success('Тип расчета обновлен')
    }
  }

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingKey('')
    setEditingValue('')
  }

  // Добавить новый тип расчета
  const addCalculationType = () => {
    const newId = Math.max(...calculationTypes.map(calculationType => calculationType.id), 0) + 1
    const newCalculationType: CalculationTypeItem = {
      key: newId.toString(),
      id: newId,
      name: `Тип расчета ${newId}`
    }
    const updatedCalculationTypes = [...calculationTypes, newCalculationType]
    setCalculationTypes(updatedCalculationTypes)
    saveCalculationTypes(updatedCalculationTypes)
    message.success('Новый тип расчета добавлен')
  }

  // Удалить тип расчета
  const deleteCalculationType = (key: string) => {
    const updatedCalculationTypes = calculationTypes.filter(calculationType => calculationType.key !== key)
    setCalculationTypes(updatedCalculationTypes)
    saveCalculationTypes(updatedCalculationTypes)
    message.success('Тип расчета удален')
  }

  // Начать редактирование заголовка столбца
  const startEditColumnHeader = () => {
    setEditingColumnHeader(true)
    setColumnHeaderValue(columnTitle)
  }

  // Сохранить заголовок столбца
  const saveColumnHeader = () => {
    if (columnHeaderValue.trim()) {
      setColumnTitle(columnHeaderValue.trim())
      localStorage.setItem('calculationTypesColumnTitle', columnHeaderValue.trim())
      setEditingColumnHeader(false)
      setColumnHeaderValue('')
      message.success('Заголовок столбца обновлен')
    }
  }

  // Отменить редактирование заголовка столбца
  const cancelEditColumnHeader = () => {
    setEditingColumnHeader(false)
    setColumnHeaderValue('')
  }

  const columns = [
    {
      title: '№ п/п',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: number, record: CalculationTypeItem, index: number) => (
        <div className="text-center font-medium">{index + 1}</div>
      )
    },
    {
      title: editingColumnHeader ? (
        <div className="flex items-center gap-2">
          <Input
            value={columnHeaderValue}
            onChange={(e) => setColumnHeaderValue(e.target.value)}
            onPressEnter={saveColumnHeader}
            autoFocus
            size="small"
          />
          <Button
            type="link"
            size="small"
            icon={<SaveOutlined />}
            onClick={saveColumnHeader}
            className="text-green-600"
          />
          <Button
            type="link"
            size="small"
            icon={<CloseOutlined />}
            onClick={cancelEditColumnHeader}
            className="text-red-600"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <span>{columnTitle}</span>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={startEditColumnHeader}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: CalculationTypeItem) => {
        const isEditing = editingKey === record.key

        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onPressEnter={saveEdit}
                autoFocus
              />
              <Button
                type="link"
                size="small"
                icon={<SaveOutlined />}
                onClick={saveEdit}
                className="text-green-600"
              />
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={cancelEdit}
                className="text-red-600"
              />
            </div>
          )
        }

        return (
          <div className="flex items-center justify-between group">
            <span>{name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => startEdit(record.key, name)}
              />
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => deleteCalculationType(record.key)}
                className="text-red-600"
              />
            </div>
          </div>
        )
      }
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>Справочник типов расчета</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addCalculationType}
        >
          Добавить тип расчета
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={calculationTypes}
        pagination={false}
        bordered
        size="middle"
        className="calculation-type-table"
      />
    </div>
  )
}

export default CalculationTypeTable