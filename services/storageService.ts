
import { User, Task, Category, TaskStatus, TaskPriority } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

/**
 * خدمة إدارة التخزين المحلي (Local Storage Service)
 * تعمل كطبقة قاعدة بيانات (Database Layer) لتنظيم بيانات المستخدمين والمهام والتصنيفات.
 */

const STORAGE_KEYS = {
  USERS: 'maham_database_users',
  SESSION: 'maham_active_session',
  USER_TASKS_PREFIX: 'maham_tasks_',
  USER_CATS_PREFIX: 'maham_cats_'
};

export const storageService = {
  // --- إدارة سجل المستخدمين العام ---
  
  /** الحصول على قائمة جميع المستخدمين المسجلين */
  getUsers: (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Database Error: Could not parse users registry", error);
      return [];
    }
  },

  /** إضافة مستخدم جديد للسجل */
  registerUser: (userData: any): void => {
    const users = storageService.getUsers();
    users.push(userData);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // --- إدارة الجلسة النشطة ---

  setSession: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  },

  getSession: (): User | null => {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  clearSession: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // --- إدارة بيانات المستخدم المعزولة ---

  /** الحصول على مهام مستخدم معين */
  getUserTasks: (username: string): Task[] => {
    try {
      const key = STORAGE_KEYS.USER_TASKS_PREFIX + username.toLowerCase();
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** حفظ مهام مستخدم معين */
  saveUserTasks: (username: string, tasks: Task[]): void => {
    const key = STORAGE_KEYS.USER_TASKS_PREFIX + username.toLowerCase();
    localStorage.setItem(key, JSON.stringify(tasks));
  },

  /** الحصول على تصنيفات مستخدم معين */
  getUserCategories: (username: string): Category[] => {
    try {
      const key = STORAGE_KEYS.USER_CATS_PREFIX + username.toLowerCase();
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  /** حفظ تصنيفات مستخدم معين */
  saveUserCategories: (username: string, categories: Category[]): void => {
    const key = STORAGE_KEYS.USER_CATS_PREFIX + username.toLowerCase();
    localStorage.setItem(key, JSON.stringify(categories));
  },

  // --- تهيئة الحساب الجديد ---

  /** إنشاء بيئة عمل نظيفة ومحترفة للمستخدم الجديد */
  initializeNewAccount: (username: string): void => {
    const welcomeTask: Task = {
      id: 'welcome-' + Date.now(),
      title: 'مرحباً بك في مهامي! 🚀',
      description: 'هذه أول مهمة لك في قاعدتك البيانات الجديدة. يمكنك تعديل هذه المهمة أو حذفها للبدء في تنظيم يومك.',
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      category: 'شخصي',
      color: '#10b981',
      icon: 'user',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subTasks: [],
      isPinned: true
    };

    storageService.saveUserTasks(username, [welcomeTask]);
    storageService.saveUserCategories(username, DEFAULT_CATEGORIES);
  }
};
