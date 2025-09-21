import React, { useState, useEffect } from 'react'
import { Table, Input, Button, Typography, App } from 'antd'
import { PlusOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography

interface StatusItem {
  key: string
  id: number
  name: string
}

const StatusTable: React.FC = () => {
  const { message } = App.useApp()
  const [statuses, setStatuses] = useState<StatusItem[]>([])
  const [editingKey, setEditingKey] = useState<string>('')
  const [editingValue, setEditingValue] = useState<string>('')
  const [editingColumnHeader, setEditingColumnHeader] = useState<boolean>(false)
  const [columnHeaderValue, setColumnHeaderValue] = useState<string>('')
  const [columnTitle, setColumnTitle] = useState<string>('Наименование статуса')

  // Загрузка статусов из localStorage
  useEffect(() => {
    const savedStatuses = localStorage.getItem('statuses')
    if (savedStatuses) {
      try {
        const parsedStatuses = JSON.parse(savedStatuses)
        setStatuses(parsedStatuses)
      } catch (error) {
        console.error('Ошибка загрузки статусов:', error)
      }
    } else {
      // Начальные данные
      const initialStatuses = [
        { key: '1', id: 1, name: 'Статус 1' },
        { key: '2', id: 2, name: 'Статус 2' },
        { key: '3', id: 3, name: 'Статус 3' }
      ]
      setStatuses(initialStatuses)
      saveStatuses(initialStatuses)
    }

    const savedColumnTitle = localStorage.getItem('statusesColumnTitle')
    if (savedColumnTitle) {
      setColumnTitle(savedColumnTitle)
    }
  }, [])

  // Сохранение статусов в localStorage
  const saveStatuses = (statusesToSave: StatusItem[]) => {
    try {
      localStorage.setItem('statuses', JSON.stringify(statusesToSave))
    } catch (error) {
      console.error('Ошибка сохранения статусов:', error)
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
      const updatedStatuses = statuses.map(status => 
        status.key === editingKey 
          ? { ...status, name: editingValue.trim() }
          : status
      )
      setStatuses(updatedStatuses)
      saveStatuses(updatedStatuses)
      setEditingKey('')
      setEditingValue('')
      message.success('Статус обновлен')
    }
  }

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingKey('')
    setEditingValue('')
  }

  // Добавить новый статус
  const addStatus = () => {
    const newId = Math.max(...statuses.map(status => status.id), 0) + 1
    const newStatus: StatusItem = {
      key: newId.toString(),
      id: newId,
      name: `Статус ${newId}`
    }
    const updatedStatuses = [...statuses, newStatus]
    setStatuses(updatedStatuses)
    saveStatuses(updatedStatuses)
    message.success('Новый статус добавлен')
  }

  // Удалить статус
  const deleteStatus = (key: string) => {
    const updatedStatuses = statuses.filter(status => status.key !== key)
    setStatuses(updatedStatuses)
    saveStatuses(updatedStatuses)
    message.success('Статус удален')
  }

  const startEditColumnHeader = () => {
    setEditingColumnHeader(true)
    setColumnHeaderValue(columnTitle)
  }

  const saveColumnHeader = () => {
    if (columnHeaderValue.trim()) {
      setColumnTitle(columnHeaderValue.trim())
      localStorage.setItem('statusesColumnTitle', columnHeaderValue.trim())
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
      render: (id: number, record: StatusItem, index: number) => (
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
      render: (name: string, record: StatusItem) => {
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
                onClick={() => deleteStatus(record.key)}
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
        <Title level={3}>Справочник статусов</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addStatus}
        >
          Добавить статус
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={statuses}
        pagination={false}
        bordered
        size="middle"
        className="status-table"
      />
    </div>
  )
}

export default StatusTable