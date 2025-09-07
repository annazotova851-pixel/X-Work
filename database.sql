-- SQL схема для корпоративного портала X-Work
-- Таблицы для справочников и дополнительных работ

-- Справочник единиц измерения
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица дополнительных работ
CREATE TABLE additional_works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    materials VARCHAR(255) NOT NULL,
    quantity_pd DECIMAL(15,3) NOT NULL DEFAULT 0,
    quantity_recount DECIMAL(15,3) NOT NULL DEFAULT 0,
    unit_id UUID REFERENCES units(id),
    project_id UUID,
    created_by UUID,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX idx_units_code ON units(code);
CREATE INDEX idx_units_active ON units(is_active);
CREATE INDEX idx_additional_works_unit ON additional_works(unit_id);
CREATE INDEX idx_additional_works_project ON additional_works(project_id);
CREATE INDEX idx_additional_works_created_by ON additional_works(created_by);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_additional_works_updated_at BEFORE UPDATE ON additional_works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Вставка базовых единиц измерения
INSERT INTO units (code, name, short_name) VALUES
('м', 'Метр', 'м'),
('кг', 'Килограмм', 'кг'),
('шт', 'Штука', 'шт'),
('л', 'Литр', 'л'),
('м2', 'Квадратный метр', 'м²'),
('м3', 'Кубический метр', 'м³'),
('т', 'Тонна', 'т'),
('км', 'Километр', 'км'),
('час', 'Час', 'ч'),
('мин', 'Минута', 'мин');

-- Пример дополнительных работ для тестирования
INSERT INTO additional_works (materials, quantity_pd, quantity_recount, unit_id) 
SELECT 
    'Бетон М300',
    15.5,
    16.2,
    u.id
FROM units u WHERE u.code = 'м3';

INSERT INTO additional_works (materials, quantity_pd, quantity_recount, unit_id)
SELECT 
    'Арматура стальная',
    1200,
    1250,
    u.id
FROM units u WHERE u.code = 'кг';

-- Пример проектов для тестирования
INSERT INTO projects (name, code, description, photo_url) VALUES
('Жилой комплекс "Солнечный"', 'ЖК-СОЛ-001', 'Многоэтажный жилой комплекс на 150 квартир', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'),
('Торговый центр "Галактика"', 'ТЦ-ГАЛ-002', 'Современный торгово-развлекательный центр', 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop'),
('Офисное здание "Бизнес-центр Альфа"', 'ОЗ-БЦА-003', 'Класс А офисное здание в центре города', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'),
('Промышленный склад', 'ПС-001-004', 'Логистический центр для крупных грузов', 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=800&h=600&fit=crop');