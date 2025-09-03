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