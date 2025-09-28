import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Typography,
  Breadcrumb,
  message,
  Form,
  Modal
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useProjects } from '../contexts/ProjectsContext'
import { supabase } from '../lib/supabase'
import type { Project } from '../types'
import AdditionalWorksTable from '../components/AdditionalWorksTable'

const { Title } = Typography

interface ProjectParameter {
  id: string
  parameter: string
  value: string
  sort_order: number
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { projects } = useProjects()
  const [project, setProject] = useState<Project | null>(null)
  const [projectData, setProjectData] = useState<ProjectParameter[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (id && projects.length > 0) {
      const foundProject = projects.find(p => p.id === id)
      setProject(foundProject || null)
      if (foundProject) {
        loadProjectParameters(foundProject.id)
      }
    }
  }, [id, projects])

  const loadProjectParameters = async (projectId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_parameters')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order')

      if (error) throw error
      setProjectData(data || [])
    } catch (error) {
      console.error('Error loading project parameters:', error)
      message.error('Ошибка загрузки параметров проекта')
    } finally {
      setLoading(false)
    }
  }

  const startCellEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field })
    setEditValue(currentValue)
  }

  const saveCellEdit = async () => {
    if (!editingCell) return

    try {
      const { error } = await supabase
        .from('project_parameters')
        .update({ [editingCell.field]: editValue })
        .eq('id', editingCell.id)

      if (error) throw error

      const newData = projectData.map(item =>
        item.id === editingCell.id
          ? { ...item, [editingCell.field]: editValue }
          : item
      )
      setProjectData(newData)
      setEditingCell(null)
      setEditValue('')
      message.success('Параметр обновлен')
    } catch (error) {
      console.error('Error updating parameter:', error)
      message.error('Ошибка при обновлении параметра')
    }
  }

  const handleAdd = async (values: { parameter: string; value: string }) => {
    if (!project) return

    try {
      const maxSortOrder = Math.max(...projectData.map(p => p.sort_order), 0)
      const { data, error } = await supabase
        .from('project_parameters')
        .insert({
          project_id: project.id,
          parameter: values.parameter,
          value: values.value,
          sort_order: maxSortOrder + 1
        })
        .select()
        .single()

      if (error) throw error

      setProjectData([...projectData, data])
      setIsModalVisible(false)
      form.resetFields()
      message.success('Параметр добавлен')
    } catch (error) {
      console.error('Error adding parameter:', error)
      message.error('Ошибка при добавлении параметра')
    }
  }

  const columns = [
    {
      title: 'Параметр',
      dataIndex: 'parameter',
      key: 'parameter',
      render: (text: string, record: ProjectParameter) => {
        const isEditing = editingCell?.id === record.id && editingCell?.field === 'parameter'

        if (isEditing) {
          return (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onPressEnter={saveCellEdit}
              onBlur={saveCellEdit}
              autoFocus
            />
          )
        }

        return (
          <div
            className="cursor-pointer hover:bg-gray-50 p-2 rounded"
            onClick={() => startCellEdit(record.id, 'parameter', text)}
          >
            {text}
          </div>
        )
      }
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
      render: (text: string, record: ProjectParameter) => {
        const isEditing = editingCell?.id === record.id && editingCell?.field === 'value'

        if (isEditing) {
          return (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onPressEnter={saveCellEdit}
              onBlur={saveCellEdit}
              autoFocus
            />
          )
        }

        return (
          <div
            className="cursor-pointer hover:bg-gray-50 p-2 rounded"
            onClick={() => startCellEdit(record.id, 'value', text)}
          >
            {text}
          </div>
        )
      }
    }
  ]

  if (!project) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={4} type="secondary">Проект не найден</Title>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Breadcrumb items={[
          { title: <Link to="/"><ArrowLeftOutlined /> Главная</Link> },
          { title: project.name }
        ]} />

        <div>
          <Title level={2} style={{ margin: 0 }}>{project.name}</Title>
        </div>

        <Card
          title="Параметры проекта"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Добавить параметр
            </Button>
          }
        >
          <Table
            dataSource={projectData}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{ emptyText: 'Нет параметров' }}
          />
        </Card>

        <AdditionalWorksTable projectId={project.id} />
      </Space>

      <Modal
        title="Добавить параметр"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            label="Параметр"
            name="parameter"
            rules={[{ required: true, message: 'Введите название параметра' }]}
          >
            <Input placeholder="Название параметра" />
          </Form.Item>
          <Form.Item
            label="Значение"
            name="value"
            rules={[{ required: true, message: 'Введите значение' }]}
          >
            <Input placeholder="Значение параметра" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Добавить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}