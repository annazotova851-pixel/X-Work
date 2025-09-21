import React, { useState, useEffect } from 'react'
import { Table, Input, Button, Typography, App } from 'antd'
import { PlusOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography

interface StageItem {
  key: string
  id: number
  name: string
}

const StageTable: React.FC = () => {
  const { message } = App.useApp()
  const [stages, setStages] = useState<StageItem[]>([])
  const [editingKey, setEditingKey] = useState<string>('')
  const [editingValue, setEditingValue] = useState<string>('')
  const [editingColumnHeader, setEditingColumnHeader] = useState<boolean>(false)
  const [columnHeaderValue, setColumnHeaderValue] = useState<string>('')
  const [columnTitle, setColumnTitle] = useState<string>('Наименование этапа')

  // Загрузка этапов из localStorage
  useEffect(() => {
    const savedStages = localStorage.getItem('stages')
    if (savedStages) {
      try {
        const parsedStages = JSON.parse(savedStages)
        setStages(parsedStages)
      } catch (error) {
        console.error('Ошибка загрузки этапов:', error)
      }
    } else {
      // Начальные данные
      const initialStages = [
        { key: '1', id: 1, name: 'Этап 1' },
        { key: '2', id: 2, name: 'Этап 2' },
        { key: '3', id: 3, name: 'Этап 3' }
      ]
      setStages(initialStages)
      saveStages(initialStages)
    }

    const savedColumnTitle = localStorage.getItem('stagesColumnTitle')
    if (savedColumnTitle) {
      setColumnTitle(savedColumnTitle)
    }
  }, [])

  // Сохранение этапов в localStorage
  const saveStages = (stagesToSave: StageItem[]) => {
    try {
      localStorage.setItem('stages', JSON.stringify(stagesToSave))
    } catch (error) {
      console.error('Ошибка сохранения этапов:', error)
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
      const updatedStages = stages.map(stage => 
        stage.key === editingKey 
          ? { ...stage, name: editingValue.trim() }
          : stage
      )
      setStages(updatedStages)
      saveStages(updatedStages)
      setEditingKey('')
      setEditingValue('')
      message.success('Этап обновлен')
    }
  }

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingKey('')
    setEditingValue('')
  }

  // Добавить новый этап
  const addStage = () => {
    const newId = Math.max(...stages.map(stage => stage.id), 0) + 1
    const newStage: StageItem = {
      key: newId.toString(),
      id: newId,
      name: `Этап ${newId}`
    }
    const updatedStages = [...stages, newStage]
    setStages(updatedStages)
    saveStages(updatedStages)
    message.success('Новый этап добавлен')
  }

  // Удалить этап
  const deleteStage = (key: string) => {
    const updatedStages = stages.filter(stage => stage.key !== key)
    setStages(updatedStages)
    saveStages(updatedStages)
    message.success('Этап удален')
  }

  const startEditColumnHeader = () => {
    setEditingColumnHeader(true)
    setColumnHeaderValue(columnTitle)
  }

  const saveColumnHeader = () => {
    if (columnHeaderValue.trim()) {
      setColumnTitle(columnHeaderValue.trim())
      localStorage.setItem('stagesColumnTitle', columnHeaderValue.trim())
      setEditingColumnHeader(false)
      setColumnHeaderValue('')
      message.success('Заголовок столбца обновлен')
    }
  }

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
      render: (id: number, record: StageItem, index: number) => (
        <div className="text-center font-medium">{index + 1}</div>
      )
    },
    {
      title: editingColumnHeader ? (
        <div className="flex items-center gap-2">
          <Input value={columnHeaderValue} onChange={(e) => setColumnHeaderValue(e.target.value)} onPressEnter={saveColumnHeader} autoFocus size="small" />
          <Button type="link" size="small" icon={<SaveOutlined />} onClick={saveColumnHeader} className="text-green-600" />
          <Button type="link" size="small" icon={<CloseOutlined />} onClick={cancelEditColumnHeader} className="text-red-600" />
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <span>{columnTitle}</span>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={startEditColumnHeader} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: StageItem) => {
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
                onClick={() => deleteStage(record.key)}
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
        <Title level={3}>Справочник этапов</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addStage}
        >
          Добавить этап
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={stages}
        pagination={false}
        bordered
        size="middle"
        className="stage-table"
      />
    </div>
  )
}

export default StageTable