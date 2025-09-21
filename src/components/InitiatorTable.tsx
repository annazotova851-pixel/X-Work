import React, { useState, useEffect } from 'react'
import { Table, Input, Button, Typography, App } from 'antd'
import { PlusOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography

interface InitiatorItem {
  key: string
  id: number
  name: string
}

const InitiatorTable: React.FC = () => {
  const { message } = App.useApp()
  const [initiators, setInitiators] = useState<InitiatorItem[]>([])
  const [editingKey, setEditingKey] = useState<string>('')
  const [editingValue, setEditingValue] = useState<string>('')
  const [editingColumnHeader, setEditingColumnHeader] = useState<boolean>(false)
  const [columnHeaderValue, setColumnHeaderValue] = useState<string>('')
  const [columnTitle, setColumnTitle] = useState<string>('Наименование инициатора')

  // Загрузка инициаторов из localStorage
  useEffect(() => {
    const savedInitiators = localStorage.getItem('initiators')
    if (savedInitiators) {
      try {
        const parsedInitiators = JSON.parse(savedInitiators)
        setInitiators(parsedInitiators)
      } catch (error) {
        console.error('Ошибка загрузки инициаторов:', error)
      }
    } else {
      // Начальные данные
      const initialInitiators = [
        { key: '1', id: 1, name: 'Инициатор 1' },
        { key: '2', id: 2, name: 'Инициатор 2' },
        { key: '3', id: 3, name: 'Инициатор 3' }
      ]
      setInitiators(initialInitiators)
      saveInitiators(initialInitiators)
    }

    // Загрузка заголовка столбца
    const savedColumnTitle = localStorage.getItem('initiatorsColumnTitle')
    if (savedColumnTitle) {
      setColumnTitle(savedColumnTitle)
    }
  }, [])

  // Сохранение инициаторов в localStorage
  const saveInitiators = (initiatorsToSave: InitiatorItem[]) => {
    try {
      localStorage.setItem('initiators', JSON.stringify(initiatorsToSave))
    } catch (error) {
      console.error('Ошибка сохранения инициаторов:', error)
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
      const updatedInitiators = initiators.map(initiator => 
        initiator.key === editingKey 
          ? { ...initiator, name: editingValue.trim() }
          : initiator
      )
      setInitiators(updatedInitiators)
      saveInitiators(updatedInitiators)
      setEditingKey('')
      setEditingValue('')
      message.success('Инициатор обновлен')
    }
  }

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingKey('')
    setEditingValue('')
  }

  // Добавить нового инициатора
  const addInitiator = () => {
    const newId = Math.max(...initiators.map(initiator => initiator.id), 0) + 1
    const newInitiator: InitiatorItem = {
      key: newId.toString(),
      id: newId,
      name: `Инициатор ${newId}`
    }
    const updatedInitiators = [...initiators, newInitiator]
    setInitiators(updatedInitiators)
    saveInitiators(updatedInitiators)
    message.success('Новый инициатор добавлен')
  }

  // Удалить инициатора
  const deleteInitiator = (key: string) => {
    const updatedInitiators = initiators.filter(initiator => initiator.key !== key)
    setInitiators(updatedInitiators)
    saveInitiators(updatedInitiators)
    message.success('Инициатор удален')
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
      localStorage.setItem('initiatorsColumnTitle', columnHeaderValue.trim())
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
      render: (id: number, record: InitiatorItem, index: number) => (
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
      render: (name: string, record: InitiatorItem) => {
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
                onClick={() => deleteInitiator(record.key)}
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
        <Title level={3}>Справочник инициаторов</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addInitiator}
        >
          Добавить инициатора
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={initiators}
        pagination={false}
        bordered
        size="middle"
        className="initiator-table"
      />
    </div>
  )
}

export default InitiatorTable