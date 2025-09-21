import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Input, Modal, App } from 'antd'
import { 
  FolderOutlined, 
  HomeOutlined, 
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  BookOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useProjects } from '../contexts/ProjectsContext'
import type { MenuProps } from 'antd'

const { Sider, Content, Header } = AntLayout

interface LayoutProps {
  children: ReactNode
}

interface ReferenceType {
  key: string
  title: string
  description: string
}

export default function Layout({ children }: LayoutProps) {
  const { message, modal } = App.useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [newProject, setNewProject] = useState({ name: '' })
  const { projects, loading: projectsLoading, updateProject, addProject } = useProjects()

  // Принудительное обновление справочников при монтировании
  useEffect(() => {
    const defaultReferences = [
      { key: 'units', title: 'Единицы измерения', description: 'Справочник единиц измерения для материалов и работ' },
      { key: 'materials', title: 'Материалы', description: 'Справочник строительных материалов' },
      { key: 'workers', title: 'Сотрудники', description: 'Справочник сотрудников и исполнителей' },
      { key: 'categories', title: 'Категории работ', description: 'Справочник категорий строительных работ' },
      { key: 'suppliers', title: 'Поставщики', description: 'Справочник поставщиков материалов и услуг' },
      { key: 'tags', title: 'Тэг', description: 'Справочник тэгов рабочей документации' },
      { key: 'calculation_types', title: 'Тип расчета', description: 'Справочник типов расчетов для проектной документации' },
      { key: 'documents', title: 'Документы', description: 'Справочник документов проекта' },
      { key: 'statuses', title: 'Статус', description: 'Справочник статусов выполнения работ' },
      { key: 'stages', title: 'Этапы', description: 'Справочник этапов проекта' },
      { key: 'initiators', title: 'Инициатор', description: 'Справочник инициаторов задач и проектов' }
    ]
    
    // Загружаем список удаленных справочников
    const deletedReferences = JSON.parse(localStorage.getItem('deletedReferences') || '[]')
    const deletedKeys = new Set(deletedReferences)
    
    const saved = localStorage.getItem('referenceTypes')
    if (saved) {
      try {
        const savedReferences = JSON.parse(saved)
        const savedKeys = new Set(savedReferences.map((ref: ReferenceType) => ref.key))
        
        // Проверяем, есть ли новые справочники (исключая удаленные)
        const availableDefaultReferences = defaultReferences.filter(ref => !deletedKeys.has(ref.key))
        const hasNewReferences = availableDefaultReferences.some(ref => !savedKeys.has(ref.key))
        
        if (hasNewReferences) {
          // Перезагружаем список с новыми справочниками
          const savedMap = new Map(savedReferences.map((ref: ReferenceType) => [ref.key, ref]))
          
          const updatedReferences = availableDefaultReferences.map(defaultRef => {
            const existing = savedMap.get(defaultRef.key)
            return existing ? { ...defaultRef, title: existing.title } : defaultRef
          })
          
          // Добавляем дополнительные справочники (исключая удаленные)
          const defaultKeys = new Set(defaultReferences.map(ref => ref.key))
          const additionalReferences = savedReferences.filter((ref: ReferenceType) => 
            !defaultKeys.has(ref.key) && !deletedKeys.has(ref.key)
          )
          const finalReferences = [...updatedReferences, ...additionalReferences]
          
          setReferenceTypes(finalReferences)
          localStorage.setItem('referenceTypes', JSON.stringify(finalReferences))
        }
      } catch (error) {
        console.error('Ошибка обновления справочников:', error)
        const availableDefaultReferences = defaultReferences.filter(ref => !deletedKeys.has(ref.key))
        setReferenceTypes(availableDefaultReferences)
        localStorage.setItem('referenceTypes', JSON.stringify(availableDefaultReferences))
      }
    }
  }, [])

  // Состояние для справочников
  const [editingRefId, setEditingRefId] = useState<string | null>(null)
  const [editedRefName, setEditedRefName] = useState('')
  const [isRefModalVisible, setIsRefModalVisible] = useState(false)
  const [newReference, setNewReference] = useState({ title: '', description: '' })
  
  // Загружаем справочники из localStorage
  const [referenceTypes, setReferenceTypes] = useState<ReferenceType[]>(() => {
    const defaultReferences = [
      { key: 'units', title: 'Единицы измерения', description: 'Справочник единиц измерения для материалов и работ' },
      { key: 'materials', title: 'Материалы', description: 'Справочник строительных материалов' },
      { key: 'workers', title: 'Сотрудники', description: 'Справочник сотрудников и исполнителей' },
      { key: 'categories', title: 'Категории работ', description: 'Справочник категорий строительных работ' },
      { key: 'suppliers', title: 'Поставщики', description: 'Справочник поставщиков материалов и услуг' },
      { key: 'tags', title: 'Тэг', description: 'Справочник тэгов рабочей документации' },
      { key: 'calculation_types', title: 'Тип расчета', description: 'Справочник типов расчетов для проектной документации' },
      { key: 'documents', title: 'Документы', description: 'Справочник документов проекта' },
      { key: 'statuses', title: 'Статус', description: 'Справочник статусов выполнения работ' },
      { key: 'stages', title: 'Этапы', description: 'Справочник этапов проекта' },
      { key: 'initiators', title: 'Инициатор', description: 'Справочник инициаторов задач и проектов' }
    ]

    // Загружаем список удаленных справочников
    const deletedReferences = JSON.parse(localStorage.getItem('deletedReferences') || '[]')
    const deletedKeys = new Set(deletedReferences)

    const saved = localStorage.getItem('referenceTypes')
    let finalReferences = defaultReferences.filter(ref => !deletedKeys.has(ref.key))

    if (saved) {
      try {
        const savedReferences = JSON.parse(saved)
        
        // Создаем карту существующих справочников
        const savedMap = new Map(savedReferences.map((ref: ReferenceType) => [ref.key, ref]))
        
        // Обновляем/добавляем справочники из defaultReferences (исключая удаленные)
        finalReferences = defaultReferences
          .filter(ref => !deletedKeys.has(ref.key))
          .map(defaultRef => {
            const existing = savedMap.get(defaultRef.key)
            // Если справочник существует, сохраняем пользовательское название, но обновляем описание
            return existing ? { ...defaultRef, title: existing.title } : defaultRef
          })
        
        // Добавляем любые дополнительные справочники, которых нет в defaultReferences и которые не удалены
        const defaultKeys = new Set(defaultReferences.map(ref => ref.key))
        const additionalReferences = savedReferences.filter((ref: ReferenceType) => 
          !defaultKeys.has(ref.key) && !deletedKeys.has(ref.key)
        )
        finalReferences = [...finalReferences, ...additionalReferences]
        
      } catch (error) {
        console.error('Ошибка загрузки справочников:', error)
        finalReferences = defaultReferences.filter(ref => !deletedKeys.has(ref.key))
      }
    }
    
    // Всегда обновляем localStorage с актуальным списком
    localStorage.setItem('referenceTypes', JSON.stringify(finalReferences))
    return finalReferences
  })

  // Сохраняем справочники в localStorage
  const saveReferencesToStorage = (refs: ReferenceType[]) => {
    try {
      localStorage.setItem('referenceTypes', JSON.stringify(refs))
    } catch (error) {
      console.error('Ошибка сохранения справочников:', error)
    }
  }

  const handleEditStart = (project: any) => {
    setEditingId(project.id)
    setEditedName(project.name)
  }

  const handleEditSave = async () => {
    if (editingId && editedName.trim()) {
      try {
        await updateProject(editingId, { name: editedName.trim() })
        setEditingId(null)
        setEditedName('')
        message.success('Проект обновлен')
      } catch (error) {
        message.error('Ошибка при обновлении проекта')
      }
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditedName('')
  }

  const handleAddNew = async () => {
    if (newProject.name.trim()) {
      try {
        const code = newProject.name.trim()
          .toUpperCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-А-Я]/g, '')
          .substring(0, 20)

        await addProject({
          name: newProject.name.trim(),
          code: code || 'PROJECT-' + Date.now(),
          status: 'active'
        })
        setIsModalVisible(false)
        setNewProject({ name: '' })
        message.success('Проект добавлен')
      } catch (error) {
        message.error('Ошибка при добавлении проекта')
      }
    }
  }

  // Функции для справочников
  const handleRefEditStart = (reference: ReferenceType) => {
    setEditingRefId(reference.key)
    setEditedRefName(reference.title)
  }

  const handleRefEditSave = () => {
    if (editingRefId && editedRefName.trim()) {
      const updatedRefs = referenceTypes.map(ref => 
        ref.key === editingRefId 
          ? { ...ref, title: editedRefName.trim() }
          : ref
      )
      setReferenceTypes(updatedRefs)
      saveReferencesToStorage(updatedRefs)
      setEditingRefId(null)
      setEditedRefName('')
      message.success('Справочник обновлен')
    }
  }

  const handleRefEditCancel = () => {
    setEditingRefId(null)
    setEditedRefName('')
  }

  const handleAddReference = () => {
    if (newReference.title.trim()) {
      const key = newReference.title.trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w]/g, '')
        .substring(0, 20) || 'ref_' + Date.now()

      const newRef: ReferenceType = {
        key,
        title: newReference.title.trim(),
        description: newReference.description.trim() || 'Пользовательский справочник'
      }

      const updatedRefs = [...referenceTypes, newRef]
      setReferenceTypes(updatedRefs)
      saveReferencesToStorage(updatedRefs)
      setIsRefModalVisible(false)
      setNewReference({ title: '', description: '' })
      message.success('Справочник добавлен')
    }
  }

  const handleDeleteReference = (referenceKey: string, referenceTitle: string) => {
    modal.confirm({
      title: 'Удалить справочник?',
      content: `Вы уверены, что хотите удалить справочник "${referenceTitle}"? Это действие нельзя отменить.`,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk() {
        const updatedRefs = referenceTypes.filter(ref => ref.key !== referenceKey)
        setReferenceTypes(updatedRefs)
        saveReferencesToStorage(updatedRefs)
        
        // Сохраняем список удаленных справочников
        const deletedRefs = JSON.parse(localStorage.getItem('deletedReferences') || '[]')
        deletedRefs.push(referenceKey)
        localStorage.setItem('deletedReferences', JSON.stringify(deletedRefs))
        
        message.success('Справочник удален')
      }
    })
  }

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link to="/">Главная</Link>,
    },
    {
      key: 'sub1',
      icon: <FolderOutlined />,
      label: 'Проекты',
      children: projectsLoading ? [
        {
          key: 'loading',
          label: 'Загрузка...',
          disabled: true
        }
      ] : [
        ...projects.map((project) => ({
          key: `project-${project.id}`,
          label: editingId === project.id ? (
            <div className="flex items-center space-x-2">
              <Input
                size="small"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onPressEnter={handleEditSave}
                autoFocus
              />
              <Button
                type="link"
                size="small"
                icon={<SaveOutlined />}
                onClick={handleEditSave}
              />
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleEditCancel}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <Link to={`/projects/${project.id}`}>{project.name}</Link>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.preventDefault()
                  handleEditStart(project)
                }}
                className="opacity-0 group-hover:opacity-100"
              />
            </div>
          )
        })),
        {
          key: 'add-project',
          label: (
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              block
            >
              Добавить проект
            </Button>
          )
        }
      ]
    },
    {
      key: 'sub2',
      icon: <BookOutlined />,
      label: 'Справочники',
      children: [
        ...referenceTypes.map((reference) => ({
          key: `reference-${reference.key}`,
          label: editingRefId === reference.key ? (
            <div className="flex items-center space-x-2">
              <Input
                size="small"
                value={editedRefName}
                onChange={(e) => setEditedRefName(e.target.value)}
                onPressEnter={handleRefEditSave}
                autoFocus
              />
              <Button
                type="link"
                size="small"
                icon={<SaveOutlined />}
                onClick={handleRefEditSave}
              />
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleRefEditCancel}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <Link to={`/references/${reference.key}`}>{reference.title}</Link>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.preventDefault()
                    handleRefEditStart(reference)
                  }}
                />
                <Button
                  type="link"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeleteReference(reference.key, reference.title)
                  }}
                  className="text-red-600"
                />
              </div>
            </div>
          )
        })),
        {
          key: 'add-reference',
          label: (
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setIsRefModalVisible(true)}
              block
            >
              Добавить справочник
            </Button>
          )
        }
      ]
    }
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
        width={280}
      >
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa'
        }}>
          <h2 style={{ margin: 0, color: '#1890ff', fontWeight: 600 }}>
            {collapsed ? 'X-Work' : 'X-Work Portal'}
          </h2>
          {!collapsed && (
            <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
              Управление проектами
            </p>
          )}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1', 'sub2']}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <AntLayout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, color: '#262626' }}>
            Система управления строительными проектами
          </h1>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </AntLayout>

      <Modal
        title="Добавить новый проект"
        open={isModalVisible}
        onOk={handleAddNew}
        onCancel={() => {
          setIsModalVisible(false)
          setNewProject({ name: '' })
        }}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Input
          placeholder="Название проекта"
          value={newProject.name}
          onChange={(e) => setNewProject({ name: e.target.value })}
          onPressEnter={handleAddNew}
        />
      </Modal>

      <Modal
        title="Добавить новый справочник"
        open={isRefModalVisible}
        onOk={handleAddReference}
        onCancel={() => {
          setIsRefModalVisible(false)
          setNewReference({ title: '', description: '' })
        }}
        okText="Добавить"
        cancelText="Отмена"
      >
        <div className="space-y-4">
          <Input
            placeholder="Название справочника"
            value={newReference.title}
            onChange={(e) => setNewReference({ ...newReference, title: e.target.value })}
          />
          <Input.TextArea
            placeholder="Описание справочника (необязательно)"
            value={newReference.description}
            onChange={(e) => setNewReference({ ...newReference, description: e.target.value })}
            rows={3}
          />
        </div>
      </Modal>
    </AntLayout>
  )
}