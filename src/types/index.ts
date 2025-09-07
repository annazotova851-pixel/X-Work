export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'employee' | 'manager'
  department?: string
}

export interface Employee {
  id: string
  user_id: string
  employee_id: string
  department: string
  position: string
  hire_date: string
  status: 'active' | 'inactive'
}

export interface Task {
  id: string
  title: string
  description?: string
  assigned_to: string
  created_by: string
  due_date?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

export interface Announcement {
  id: string
  title: string
  content: string
  created_by: string
  created_at: string
  is_important: boolean
}

export interface Unit {
  id: string
  code: string
  name: string
  short_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdditionalWork {
  id: string
  materials: string
  quantity_pd: number
  quantity_recount: number
  unit_id: string
  unit?: Unit
  project_id?: string
  created_by?: string
  status: 'draft' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  code: string
  description?: string
  status: 'active' | 'completed' | 'cancelled'
  start_date?: string
  end_date?: string
  manager_id?: string
  photo_url?: string
  created_at: string
  updated_at: string
}