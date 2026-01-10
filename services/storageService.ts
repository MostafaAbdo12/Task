
import { User, Task, Category, TaskStatus, TaskPriority } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const STORAGE_KEYS = {
  USERS: 'maham_database_users',
  SESSION: 'maham_active_session',
  USER_TASKS_PREFIX: 'maham_tasks_',
  USER_CATS_PREFIX: 'maham_cats_'
};

export const storageService = {
  getUsers: (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Database Error: Could not parse users registry", error);
      return [];
    }
  },

  // فحص هل البيانات مكررة أم لا
  checkDuplicate: (username: string, email: string, phone: string): { exists: boolean, field?: string } => {
    const users = storageService.getUsers();
    
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { exists: true, field: 'اسم المستخدم' };
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { exists: true, field: 'البريد الإلكتروني' };
    }
    if (users.some(u => u.phone === phone)) {
      return { exists: true, field: 'رقم الجوال' };
    }
    
    return { exists: false };
  },

  registerUser: (userData: any): void => {
    const users = storageService.getUsers();
    users.push(userData);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser: (oldUsername: string, updatedData: Partial<User>): boolean => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.username === oldUsername);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedData };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      if (updatedData.username && updatedData.username !== oldUsername) {
        const oldTasksKey = STORAGE_KEYS.USER_TASKS_PREFIX + oldUsername.toLowerCase();
        const newTasksKey = STORAGE_KEYS.USER_TASKS_PREFIX + updatedData.username.toLowerCase();
        const tasks = localStorage.getItem(oldTasksKey);
        if (tasks) {
          localStorage.setItem(newTasksKey, tasks);
          localStorage.removeItem(oldTasksKey);
        }

        const oldCatsKey = STORAGE_KEYS.USER_CATS_PREFIX + oldUsername.toLowerCase();
        const newCatsKey = STORAGE_KEYS.USER_CATS_PREFIX + updatedData.username.toLowerCase();
        const cats = localStorage.getItem(oldCatsKey);
        if (cats) {
          localStorage.setItem(newCatsKey, cats);
          localStorage.removeItem(oldCatsKey);
        }
      }
      return true;
    }
    return false;
  },

  setSession: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  },

  getSession: (): User | null => {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!session) return null;
      const parsed = JSON.parse(session);
      
      const users = storageService.getUsers();
      const fullData = users.find(u => u.username === parsed.username);
      return fullData ? { ...fullData, lastLogin: parsed.lastLogin } : parsed;
    } catch {
      return null;
    }
  },

  clearSession: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getUserTasks: (username: string): Task[] => {
    try {
      const key = STORAGE_KEYS.USER_TASKS_PREFIX + username.toLowerCase();
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUserTasks: (username: string, tasks: Task[]): void => {
    const key = STORAGE_KEYS.USER_TASKS_PREFIX + username.toLowerCase();
    localStorage.setItem(key, JSON.stringify(tasks));
  },

  getUserCategories: (username: string): Category[] => {
    try {
      const key = STORAGE_KEYS.USER_CATS_PREFIX + username.toLowerCase();
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveUserCategories: (username: string, categories: Category[]): void => {
    const key = STORAGE_KEYS.USER_CATS_PREFIX + username.toLowerCase();
    localStorage.setItem(key, JSON.stringify(categories));
  },

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
