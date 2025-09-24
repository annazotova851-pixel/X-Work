-- SQL схема для корпоративного портала X-Work



-- Индексы для производительности

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at


-- Таблица проектов (строительных объектов)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    manager_id UUID,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_code ON projects(code);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();







-- Пример проектов для тестирования
INSERT INTO projects (name, code, description, photo_url) VALUES
('Жилой комплекс "Солнечный"', 'ЖК-СОЛ-001', 'Многоэтажный жилой комплекс на 150 квартир', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'),
('Торговый центр "Галактика"', 'ТЦ-ГАЛ-002', 'Современный торгово-развлекательный центр', 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop'),
('Офисное здание "Бизнес-центр Альфа"', 'ОЗ-БЦА-003', 'Класс А офисное здание в центре города', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'),
('Промышленный склад', 'ПС-001-004', 'Логистический центр для крупных грузов', 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=800&h=600&fit=crop'),
('ЖК "Injoy"', 'ЖК-INJ-005', 'Премиальный жилой комплекс класса комфорт+', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop');


-- Таблица для редактируемой таблицы с 21 столбцом
-- Хранит заголовки столбцов
CREATE TABLE editable_table_headers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL DEFAULT 'main_table',
    column_index INTEGER NOT NULL,
    column_title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_name, column_index)
);

-- Таблица для хранения данных ячеек
CREATE TABLE editable_table_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL DEFAULT 'main_table',
    row_index INTEGER NOT NULL,
    column_index INTEGER NOT NULL,
    cell_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_name, row_index, column_index)
);

-- Индексы для производительности
CREATE INDEX idx_editable_table_headers_table ON editable_table_headers(table_name);
CREATE INDEX idx_editable_table_headers_column ON editable_table_headers(table_name, column_index);
CREATE INDEX idx_editable_table_data_table ON editable_table_data(table_name);
CREATE INDEX idx_editable_table_data_position ON editable_table_data(table_name, row_index, column_index);

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_editable_table_headers_updated_at BEFORE UPDATE ON editable_table_headers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_editable_table_data_updated_at BEFORE UPDATE ON editable_table_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Инициализация базовых заголовков столбцов (1-21)
INSERT INTO editable_table_headers (table_name, column_index, column_title) VALUES
('main_table', 1, 'Столбец 1'),
('main_table', 2, 'Столбец 2'),
('main_table', 3, 'Столбец 3'),
('main_table', 4, 'Столбец 4'),
('main_table', 5, 'Столбец 5'),
('main_table', 6, 'Столбец 6'),
('main_table', 7, 'Столбец 7'),
('main_table', 8, 'Столбец 8'),
('main_table', 9, 'Столбец 9'),
('main_table', 10, 'Столбец 10'),
('main_table', 11, 'Столбец 11'),
('main_table', 12, 'Столбец 12'),
('main_table', 13, 'Столбец 13'),
('main_table', 14, 'Столбец 14'),
('main_table', 15, 'Столбец 15'),
('main_table', 16, 'Столбец 16'),
('main_table', 17, 'Столбец 17'),
('main_table', 18, 'Столбец 18'),
('main_table', 19, 'Столбец 19'),
('main_table', 20, 'Столбец 20'),
('main_table', 21, 'Столбец 21');