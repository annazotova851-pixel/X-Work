import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  message,
  Popconfirm,
  Modal,
  Form
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { supabase } from '../lib/supabase'

interface AdditionalWorksColumn {
  id: string
  project_id: string
  column_1_name: string
  column_2_name: string
  column_3_name: string
}

interface AdditionalWorksRow {
  id: string
  project_id: string
  column_1_value: string
  column_2_value: string
  column_3_value: string
  sort_order: number
}

interface AdditionalWorksTableProps {
  projectId: string
}


export default function AdditionalWorksTable({ projectId }: AdditionalWorksTableProps) {
  const [columns, setColumns] = useState<AdditionalWorksColumn | null>(null)
  const [rows, setRows] = useState<AdditionalWorksRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRowId, setEditingRowId] = useState('')
  const [isColumnModalVisible, setIsColumnModalVisible] = useState(false)
  const [isRowModalVisible, setIsRowModalVisible] = useState(false)
  const [columnForm] = Form.useForm()
  const [rowForm] = Form.useForm()
  const [editForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Загрузка заголовков колонок
      const { data: columnsData, error: columnsError } = await supabase
        .from('additional_works_columns')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (columnsError && columnsError.code !== 'PGRST116') {
        throw columnsError
      }

      if (!columnsData) {
        // Создаем заголовки по умолчанию
        const { data: newColumns, error: createError } = await supabase
          .from('additional_works_columns')
          .insert({
            project_id: projectId,
            column_1_name: 'Материалы/Работы',
            column_2_name: 'Количество по ПД',
            column_3_name: 'Количество по пересчету'
          })
          .select()
          .single()

        if (createError) throw createError
        setColumns(newColumns)
      } else {
        setColumns(columnsData)
      }

      // Загрузка строк
      const { data: rowsData, error: rowsError } = await supabase
        .from('additional_works_rows')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order')

      if (rowsError) throw rowsError
      setRows(rowsData || [])
    } catch (error) {
      console.error('Error loading additional works data:', error)
      message.error('Ошибка загрузки данных дополнительных работ')
    } finally {
      setLoading(false)
    }
  }

  const handleEditRow = (record: AdditionalWorksRow) => {
    setEditingRowId(record.id)
    editForm.setFieldsValue({
      column_1_value: record.column_1_value,
      column_2_value: record.column_2_value,
      column_3_value: record.column_3_value
    })
  }

  const handleSaveRow = async (id: string) => {
    try {
      const values = await editForm.validateFields()
      const { error } = await supabase
        .from('additional_works_rows')
        .update({
          column_1_value: values.column_1_value,
          column_2_value: values.column_2_value,
          column_3_value: values.column_3_value
        })
        .eq('id', id)

      if (error) throw error

      const newRows = rows.map(row =>
        row.id === id ? { ...row, ...values } : row
      )
      setRows(newRows)
      setEditingRowId('')
      message.success('Строка обновлена')
    } catch (error) {
      console.error('Error updating row:', error)
      message.error('Ошибка при обновлении строки')
    }
  }

  const handleCancelRowEdit = () => {
    setEditingRowId('')
  }

  const handleDeleteRow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('additional_works_rows')
        .delete()
        .eq('id', id)

      if (error) throw error

      const newRows = rows.filter(row => row.id !== id)
      setRows(newRows)
      message.success('Строка удалена')
    } catch (error) {
      console.error('Error deleting row:', error)
      message.error('Ошибка при удалении строки')
    }
  }

  const handleUpdateColumns = async (values: any) => {
    if (!columns) return

    try {
      const { error } = await supabase
        .from('additional_works_columns')
        .update({
          column_1_name: values.column_1_name,
          column_2_name: values.column_2_name,
          column_3_name: values.column_3_name
        })
        .eq('id', columns.id)

      if (error) throw error

      setColumns({
        ...columns,
        column_1_name: values.column_1_name,
        column_2_name: values.column_2_name,
        column_3_name: values.column_3_name
      })
      setIsColumnModalVisible(false)
      message.success('Заголовки колонок обновлены')
    } catch (error) {
      console.error('Error updating columns:', error)
      message.error('Ошибка при обновлении заголовков')
    }
  }

  const handleAddRow = async (values: any) => {
    try {
      const maxSortOrder = Math.max(...rows.map(r => r.sort_order), 0)
      const { data, error } = await supabase
        .from('additional_works_rows')
        .insert({
          project_id: projectId,
          column_1_value: values.column_1_value,
          column_2_value: values.column_2_value,
          column_3_value: values.column_3_value,
          sort_order: maxSortOrder + 1
        })
        .select()
        .single()

      if (error) throw error

      setRows([...rows, data])
      setIsRowModalVisible(false)
      rowForm.resetFields()
      message.success('Строка добавлена')
    } catch (error) {
      console.error('Error adding row:', error)
      message.error('Ошибка при добавлении строки')
    }
  }


  if (!columns) return null

  const tableColumns = [
    {
      title: columns.column_1_name,
      dataIndex: 'column_1_value',
      key: 'column_1_value',
      render: (text: string, record: AdditionalWorksRow) => {
        if (editingRowId === record.id) {
          return (
            <Form form={editForm}>
              <Form.Item name="column_1_value" style={{ margin: 0 }}>
                <Input />
              </Form.Item>
            </Form>
          )
        }
        return text
      }
    },
    {
      title: columns.column_2_name,
      dataIndex: 'column_2_value',
      key: 'column_2_value',
      render: (text: string, record: AdditionalWorksRow) => {
        if (editingRowId === record.id) {
          return (
            <Form form={editForm}>
              <Form.Item name="column_2_value" style={{ margin: 0 }}>
                <Input />
              </Form.Item>
            </Form>
          )
        }
        return text
      }
    },
    {
      title: columns.column_3_name,
      dataIndex: 'column_3_value',
      key: 'column_3_value',
      render: (text: string, record: AdditionalWorksRow) => {
        if (editingRowId === record.id) {
          return (
            <Form form={editForm}>
              <Form.Item name="column_3_value" style={{ margin: 0 }}>
                <Input />
              </Form.Item>
            </Form>
          )
        }
        return text
      }
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (text: any, record: AdditionalWorksRow) => {
        if (editingRowId === record.id) {
          return (
            <Space>
              <Button
                type="link"
                icon={<SaveOutlined />}
                onClick={() => handleSaveRow(record.id)}
                size="small"
              />
              <Button
                type="link"
                icon={<CloseOutlined />}
                onClick={handleCancelRowEdit}
                size="small"
              />
            </Space>
          )
        }
        return (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditRow(record)}
              size="small"
            />
            <Popconfirm
              title="Удалить строку?"
              onConfirm={() => handleDeleteRow(record.id)}
              okText="Да"
              cancelText="Нет"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  return (
    <>
      <Card
        title="Сведения по дополнительным работам"
        extra={
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => {
                columnForm.setFieldsValue({
                  column_1_name: columns.column_1_name,
                  column_2_name: columns.column_2_name,
                  column_3_name: columns.column_3_name
                })
                setIsColumnModalVisible(true)
              }}
            >
              Настроить колонки
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsRowModalVisible(true)}
            >
              Добавить строку
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={rows}
          columns={tableColumns}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'Нет данных' }}
        />
      </Card>

      {/* Modal для настройки колонок */}
      <Modal
        title="Настройка заголовков колонок"
        open={isColumnModalVisible}
        onCancel={() => setIsColumnModalVisible(false)}
        footer={null}
      >
        <Form
          form={columnForm}
          layout="vertical"
          onFinish={handleUpdateColumns}
        >
          <Form.Item
            label="Первая колонка"
            name="column_1_name"
            rules={[{ required: true, message: 'Введите название колонки' }]}
          >
            <Input placeholder="Название первой колонки" />
          </Form.Item>
          <Form.Item
            label="Вторая колонка"
            name="column_2_name"
            rules={[{ required: true, message: 'Введите название колонки' }]}
          >
            <Input placeholder="Название второй колонки" />
          </Form.Item>
          <Form.Item
            label="Третья колонка"
            name="column_3_name"
            rules={[{ required: true, message: 'Введите название колонки' }]}
          >
            <Input placeholder="Название третьей колонки" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Space>
              <Button onClick={() => setIsColumnModalVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal для добавления строки */}
      <Modal
        title="Добавить строку"
        open={isRowModalVisible}
        onCancel={() => {
          setIsRowModalVisible(false)
          rowForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={rowForm}
          layout="vertical"
          onFinish={handleAddRow}
        >
          <Form.Item
            label={columns.column_1_name}
            name="column_1_value"
            rules={[{ required: true, message: 'Заполните поле' }]}
          >
            <Input placeholder={`Введите ${columns.column_1_name.toLowerCase()}`} />
          </Form.Item>
          <Form.Item
            label={columns.column_2_name}
            name="column_2_value"
            rules={[{ required: true, message: 'Заполните поле' }]}
          >
            <Input placeholder={`Введите ${columns.column_2_name.toLowerCase()}`} />
          </Form.Item>
          <Form.Item
            label={columns.column_3_name}
            name="column_3_value"
            rules={[{ required: true, message: 'Заполните поле' }]}
          >
            <Input placeholder={`Введите ${columns.column_3_name.toLowerCase()}`} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Space>
              <Button onClick={() => setIsRowModalVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Добавить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}