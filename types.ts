
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum RecurrenceInterval {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface User {
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  lastLogin: string;
  xp?: number;
  level?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  color: string;
  icon?: string;
  dueDate: string;
  reminderAt?: string; // التنبيه المخصص
  reminderFired?: boolean;
  recurrence: RecurrenceInterval; // التكرار
  createdAt: string;
  updatedAt: string;
  subTasks: SubTask[];
  isPinned: boolean;
  isFavorite?: boolean;
  assignedTo?: string; // تعيين لمستخدم
  sharedWith?: string[]; // مشاركة مع مستخدمين
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
}
