import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Typography, Card } from 'antd'
import TagTable from '../components/TagTable'
import CalculationTypeTable from '../components/CalculationTypeTable'
import DocumentTable from '../components/DocumentTable'
import StatusTable from '../components/StatusTable'
import StageTable from '../components/StageTable'
import InitiatorTable from '../components/InitiatorTable'

const { Title, Paragraph } = Typography

interface ReferenceType {
  key: string
  title: string
  description: string
}

export default function References() {
  const { type } = useParams<{ type: string }>()
  const [referenceTypes, setReferenceTypes] = useState<ReferenceType[]>([])
  
  useEffect(() => {
    // Загружаем справочники из localStorage
    const saved = localStorage.getItem('referenceTypes')
    if (saved) {
      try {
        setReferenceTypes(JSON.parse(saved))
      } catch (error) {
        console.error('Ошибка загрузки справочников:', error)
      }
    }
  }, [])
  
  const referenceInfo = referenceTypes.find(ref => ref.key === type)

  if (!referenceInfo) {
    return (
      <div className="text-center p-8">
        <Title level={3}>Справочник не найден</Title>
        <Paragraph>Выберите справочник из меню слева</Paragraph>
      </div>
    )
  }

  // Если это справочник тэгов, показываем специальную таблицу
  if (referenceInfo.key === 'tags') {
    return (
      <div>
        <div className="mb-6">
          <Title level={2}>{referenceInfo.title}</Title>
        </div>
        
        <TagTable />
      </div>
    )
  }

  // Если это справочник типов расчета, показываем специальную таблицу
  if (referenceInfo.key === 'calculation_types') {
    return (
      <div>
        <div className="mb-6">
          <Title level={2}>{referenceInfo.title}</Title>
        </div>
        
        <CalculationTypeTable />
      </div>
    )
  }

  // Если это справочник документов, показываем специальную таблицу
  if (referenceInfo.key === 'documents') {
    return (
      <div>
        <div className="mb-6">
          <Title level={2}>{referenceInfo.title}</Title>
        </div>
        
        <DocumentTable />
      </div>
    )
  }

  // Если это справочник статусов, показываем специальную таблицу
  if (referenceInfo.key === 'statuses') {
    return (
      <div>
        <div className="mb-6">
          <Title level={2}>{referenceInfo.title}</Title>
        </div>
        
        <StatusTable />
      </div>
    )
  }

  // Если это справочник этапов, показываем специальную таблицу
  if (referenceInfo.key === 'stages') {
    return (
      <div>
        <div className="mb-6">
          <Title level={2}>{referenceInfo.title}</Title>
        </div>
        
        <StageTable />
      </div>
    )
  }

  // Если это справочник инициаторов, показываем специальную таблицу
  if (referenceInfo.key === 'initiators') {
    return (
      <div>
        <div className="mb-6">
          <Title level={2}>{referenceInfo.title}</Title>
        </div>
        
        <InitiatorTable />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Title level={2}>{referenceInfo.title}</Title>
      </div>
      
      <Card>
        <div className="text-center py-8">
          <Title level={4}>Справочник готов к настройке</Title>
          <Paragraph type="secondary">
            Здесь будет содержимое справочника "{referenceInfo.title}"
          </Paragraph>
        </div>
      </Card>
    </div>
  )
}