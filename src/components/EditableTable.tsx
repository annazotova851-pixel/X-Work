import React, { useState, useEffect } from 'react'
import { Table, Input, Button, Typography, Slider, Space, Select } from 'antd'
import { EditOutlined, CheckOutlined, CloseOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'

const { Text } = Typography

interface EditableTableProps {
  className?: string
}

interface ColumnHeader {
  key: string
  title: string
  editable: boolean
}

interface CellData {
  [key: string]: string
}

const EditableTable: React.FC<EditableTableProps> = ({ className }) => {
  // Функции для работы с localStorage
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error)
    }
  }

  const loadFromLocalStorage = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : defaultValue
    } catch (error) {
      console.error('Ошибка загрузки из localStorage:', error)
      return defaultValue
    }
  }

  // Инициализируем 21 столбец с базовыми названиями
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeader[]>(() => {
    return loadFromLocalStorage('tableColumnHeaders', 
      Array.from({ length: 21 }, (_, index) => ({
        key: `col_${index + 1}`,
        title: `Столбец ${index + 1}`,
        editable: false
      }))
    )
  })

  // Состояние для данных ячеек
  const [tableData, setTableData] = useState<CellData[]>(() => {
    const defaultData = Array.from({ length: 15 }, (_, rowIndex) => {
      const row: CellData = { key: `row_${rowIndex}` }
      // Используем текущие заголовки для создания пустых строк
      Array.from({ length: 21 }, (_, index) => {
        row[`col_${index + 1}`] = ''
      })
      return row
    })
    
    return loadFromLocalStorage('tableData', defaultData)
  })

  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingCell, setEditingCell] = useState<{ rowKey: string; colKey: string } | null>(null)
  const [cellEditValue, setCellEditValue] = useState('')
  
  // Состояние для масштабирования
  const [scale, setScale] = useState(() => {
    return loadFromLocalStorage('tableScale', 100)
  })

  const startEdit = (key: string, currentTitle: string) => {
    setEditingColumn(key)
    setEditValue(currentTitle)
  }

  const saveEdit = (key: string) => {
    const updatedHeaders = columnHeaders.map(col => 
      col.key === key 
        ? { ...col, title: editValue.trim() || col.title }
        : col
    )
    setColumnHeaders(updatedHeaders)
    saveToLocalStorage('tableColumnHeaders', updatedHeaders)
    setEditingColumn(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingColumn(null)
    setEditValue('')
  }

  const startCellEdit = (rowKey: string, colKey: string, currentValue: string) => {
    setEditingCell({ rowKey, colKey })
    setCellEditValue(currentValue)
  }

  const saveCellEdit = () => {
    if (!editingCell) return
    
    const updatedData = tableData.map(row => 
      row.key === editingCell.rowKey 
        ? { ...row, [editingCell.colKey]: cellEditValue }
        : row
    )
    setTableData(updatedData)
    saveToLocalStorage('tableData', updatedData)
    setEditingCell(null)
    setCellEditValue('')
  }

  const cancelCellEdit = () => {
    setEditingCell(null)
    setCellEditValue('')
  }

  // Функции для масштабирования
  const handleScaleChange = (newScale: number) => {
    setScale(newScale)
    saveToLocalStorage('tableScale', newScale)
  }

  const zoomIn = () => {
    const newScale = Math.min(scale + 10, 200)
    handleScaleChange(newScale)
  }

  const zoomOut = () => {
    const newScale = Math.max(scale - 10, 50)
    handleScaleChange(newScale)
  }

  const resetZoom = () => {
    handleScaleChange(100)
  }

  // Функция для определения типа столбца по названию
  const getColumnType = (columnTitle: string) => {
    const title = columnTitle.toLowerCase()
    if (title.includes('приоритет')) {
      return 'priority'
    }
    if (title.includes('тэг') || title.includes('тег')) {
      return 'tag'
    }
    if (title.includes('тип расчета') || title.includes('тип расчёта')) {
      return 'calculation_type'
    }
    if (title.includes('инициатор')) {
      return 'initiator'
    }
    if (title.includes('ориентировочная сумма') || title.includes('сумма доп') || title.includes('сумма дополнительных')) {
      return 'sum_range'
    }
    if (title.includes('статус')) {
      return 'status'
    }
    return 'text'
  }

  // Варианты для столбца "Приоритет"
  const priorityOptions = [
    { value: 'На перед', label: 'На перед' },
    { value: 'текущая', label: 'текущая' },
    { value: 'срочная', label: 'срочная' }
  ]

  // Варианты для столбца "Ориентировочная сумма доп. работ"
  const sumRangeOptions = [
    { value: 'до 5 млн. руб.', label: 'до 5 млн. руб.' },
    { value: 'от 5 до 50 млн. руб.', label: 'от 5 до 50 млн. руб.' },
    { value: 'свыше 50 млн. руб.', label: 'свыше 50 млн. руб.' }
  ]

  // Варианты для столбца "Статус"
  const statusOptions = [
    { value: 'Не приступали', label: 'Не приступали' },
    { value: 'в работе', label: 'в работе' },
    { value: 'направлено объекту/заказчику', label: 'направлено объекту/заказчику' },
    { value: 'перенос', label: 'перенос' }
  ]

  // Функция для загрузки тэгов из localStorage
  const getTagOptions = () => {
    try {
      const savedTags = localStorage.getItem('tags')
      console.log('Загруженные тэги из localStorage:', savedTags)
      if (savedTags) {
        const tags = JSON.parse(savedTags)
        return tags.map((tag: any) => ({
          value: tag.name,
          label: tag.name
        }))
      }
    } catch (error) {
      console.error('Ошибка загрузки тэгов:', error)
    }
    return []
  }

  // Функция для загрузки типов расчета из localStorage
  const getCalculationTypeOptions = () => {
    try {
      const savedCalculationTypes = localStorage.getItem('calculationTypes')
      if (savedCalculationTypes) {
        const calculationTypes = JSON.parse(savedCalculationTypes)
        return calculationTypes.map((calculationType: any) => ({
          value: calculationType.name,
          label: calculationType.name
        }))
      }
    } catch (error) {
      console.error('Ошибка загрузки типов расчета:', error)
    }
    return []
  }

  // Функция для загрузки инициаторов из localStorage
  const getInitiatorOptions = () => {
    try {
      const savedInitiators = localStorage.getItem('initiators')
      console.log('Загруженные инициаторы из localStorage:', savedInitiators)
      if (savedInitiators) {
        const initiators = JSON.parse(savedInitiators)
        console.log('Распарсенные инициаторы:', initiators)
        const options = initiators.map((initiator: any) => ({
          value: initiator.name,
          label: initiator.name
        }))
        console.log('Опции для селекта:', options)
        return options
      }
    } catch (error) {
      console.error('Ошибка загрузки инициаторов:', error)
    }
    return []
  }

  // Создаем колонки для таблицы
  const columns = columnHeaders.map((header, index) => ({
    title: (
      <div className="flex items-center justify-between min-w-[120px]">
        {editingColumn === header.key ? (
          <div className="flex items-center gap-1 w-full">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onPressEnter={() => saveEdit(header.key)}
              size="small"
              className="flex-1"
              autoFocus
            />
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => saveEdit(header.key)}
              className="text-green-600"
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={cancelEdit}
              className="text-red-600"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between w-full group">
            <Text className="flex-1 text-center">{header.title}</Text>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => startEdit(header.key, header.title)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}
      </div>
    ),
    dataIndex: header.key,
    key: header.key,
    width: Math.max(60, Math.round(140 * (scale / 100))),
    render: (text: string, record: CellData) => {
      // Для строки с номерами - просто отображаем номер
      if (record.key === 'numbering') {
        return (
          <div 
            className="text-center font-medium text-gray-600"
            style={{ 
              fontSize: Math.max(10, Math.round(14 * (scale / 100))),
              minHeight: Math.max(24, Math.round(32 * (scale / 100))),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${Math.max(2, Math.round(8 * (scale / 100)))}px`
            }}
          >
            {index + 1}
          </div>
        )
      }

      // Для обычных ячеек - делаем редактируемыми
      const isEditing = editingCell?.rowKey === record.key && editingCell?.colKey === header.key
      const columnType = getColumnType(header.title)
      
      if (isEditing) {
        // Если это столбец "Приоритет", показываем Select
        if (columnType === 'priority') {
          return (
            <div className="flex items-center gap-1">
              <Select
                value={cellEditValue || undefined}
                onChange={(value) => setCellEditValue(value || '')}
                onBlur={saveCellEdit}
                size={scale < 80 ? 'small' : 'middle'}
                style={{
                  width: '100%',
                  fontSize: Math.max(10, Math.round(14 * (scale / 100))),
                  minHeight: Math.max(24, Math.round(32 * (scale / 100)))
                }}
                options={priorityOptions}
                placeholder="Выберите приоритет"
                allowClear
                autoFocus
              />
            </div>
          )
        }

        // Если это столбец "Тэг", показываем Select с тэгами
        if (columnType === 'tag') {
          const tagOptions = getTagOptions()
          return (
            <div className="flex items-center gap-1">
              <Select
                value={cellEditValue || undefined}
                onChange={(value) => setCellEditValue(value || '')}
                onBlur={saveCellEdit}
                size={scale < 80 ? 'small' : 'middle'}
                style={{
                  width: '100%',
                  fontSize: Math.max(10, Math.round(14 * (scale / 100))),
                  minHeight: Math.max(24, Math.round(32 * (scale / 100)))
                }}
                options={tagOptions}
                placeholder="Выберите тэг"
                allowClear
                autoFocus
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
          )
        }

        // Если это столбец "Тип расчета", показываем Select с типами расчета
        if (columnType === 'calculation_type') {
          const calculationTypeOptions = getCalculationTypeOptions()
          return (
            <div className="flex items-center gap-1">
              <Select
                value={cellEditValue || undefined}
                onChange={(value) => setCellEditValue(value || '')}
                onBlur={saveCellEdit}
                size={scale < 80 ? 'small' : 'middle'}
                style={{
                  width: '100%',
                  fontSize: Math.max(10, Math.round(14 * (scale / 100))),
                  minHeight: Math.max(24, Math.round(32 * (scale / 100)))
                }}
                options={calculationTypeOptions}
                placeholder="Выберите тип расчета"
                allowClear
                autoFocus
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
          )
        }

        // Если это столбец "Инициатор", показываем Select с инициаторами
        if (columnType === 'initiator') {
          const initiatorOptions = getInitiatorOptions()
          return (
            <div className="flex items-center gap-1">
              <Select
                value={cellEditValue || undefined}
                onChange={(value) => setCellEditValue(value || '')}
                onBlur={saveCellEdit}
                size={scale < 80 ? 'small' : 'middle'}
                style={{
                  width: '100%',
                  fontSize: Math.max(10, Math.round(14 * (scale / 100))),
                  minHeight: Math.max(24, Math.round(32 * (scale / 100)))
                }}
                options={initiatorOptions}
                placeholder="Выберите инициатора"
                allowClear
                autoFocus
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
          )
        }

        // Если это столбец "Ориентировочная сумма доп. работ", показываем Select с диапазонами сумм
        if (columnType === 'sum_range') {
          return (
            <div className="flex items-center gap-1">
              <Select
                value={cellEditValue || undefined}
                onChange={(value) => setCellEditValue(value || '')}
                onBlur={saveCellEdit}
                size={scale < 80 ? 'small' : 'middle'}
                style={{
                  width: '100%',
                  fontSize: Math.max(10, Math.round(14 * (scale / 100))),
                  minHeight: Math.max(24, Math.round(32 * (scale / 100)))
                }}
                options={sumRangeOptions}
                placeholder="Выберите диапазон суммы"
                allowClear
                autoFocus
              />
            </div>
          )
        }

        // Если это столбец "Статус", показываем Select со статусами
        if (columnType === 'status') {
          return (
            <div className="flex items-center gap-1">
              <Select
                value={cellEditValue || undefined}
                onChange={(value) => setCellEditValue(value || '')}
                onBlur={saveCellEdit}
                size={scale < 80 ? 'small' : 'middle'}
                style={{
                  width: '100%',
                  fontSize: Math.max(10, Math.round(14 * (scale / 100))),
                  minHeight: Math.max(24, Math.round(32 * (scale / 100)))
                }}
                options={statusOptions}
                placeholder="Выберите статус"
                allowClear
                autoFocus
              />
            </div>
          )
        }

        // Для обычных текстовых ячеек
        return (
          <div className="flex items-center gap-1">
            <Input
              value={cellEditValue}
              onChange={(e) => setCellEditValue(e.target.value)}
              onPressEnter={saveCellEdit}
              onBlur={saveCellEdit}
              size={scale < 80 ? 'small' : 'middle'}
              style={{
                fontSize: Math.max(10, Math.round(14 * (scale / 100))),
                minHeight: Math.max(24, Math.round(32 * (scale / 100)))
              }}
              autoFocus
            />
          </div>
        )
      }

      return (
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-50 px-2 rounded"
          style={{ 
            minHeight: Math.max(24, Math.round(32 * (scale / 100))),
            fontSize: Math.max(10, Math.round(14 * (scale / 100))),
            padding: `${Math.max(2, Math.round(8 * (scale / 100)))}px ${Math.max(4, Math.round(8 * (scale / 100)))}px`
          }}
          onClick={() => startCellEdit(record.key, header.key, text || '')}
        >
          {text}
        </div>
      )
    }
  }))

  // Данные для строки с нумерацией
  const numberingData: CellData = {
    key: 'numbering',
    ...columnHeaders.reduce((acc, header, index) => ({
      ...acc,
      [header.key]: (index + 1).toString()
    }), {})
  }

  const dataSource = [numberingData, ...tableData]

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Реестр планируемых расчетов</h2>
            <Text type="secondary">
              Нажмите на иконку редактирования рядом с названием столбца для изменения
            </Text>
          </div>
          
          <div className="flex items-center gap-4">
            <Text strong>Масштаб: {scale}%</Text>
            <Space>
              <Button 
                type="text" 
                icon={<ZoomOutOutlined />} 
                onClick={zoomOut}
                disabled={scale <= 50}
                title="Уменьшить масштаб"
              />
              <Slider
                min={50}
                max={200}
                step={10}
                value={scale}
                onChange={handleScaleChange}
                style={{ width: 120 }}
                tooltip={{ formatter: (value) => `${value}%` }}
              />
              <Button 
                type="text" 
                icon={<ZoomInOutlined />} 
                onClick={zoomIn}
                disabled={scale >= 200}
                title="Увеличить масштаб"
              />
              <Button 
                type="default" 
                size="small"
                onClick={resetZoom}
                title="Сбросить масштаб"
              >
                100%
              </Button>
            </Space>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto" style={{ maxHeight: '80vh' }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size={scale < 80 ? 'small' : scale > 120 ? 'large' : 'middle'}
          bordered
          scroll={{ x: 'max-content', y: '70vh' }}
          className="editable-table"
          rowClassName={(record) => 
            record.key === 'numbering' ? 'bg-gray-50 font-medium' : ''
          }
        />
      </div>
    </div>
  )
}

export default EditableTable