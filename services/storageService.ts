
import { User, Task, Category, TaskStatus, TaskPriority } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

/**
 * نظام إدارة البيانات العالمي (Global Database Engine)
 * ملاحظة: في بيئة الإنتاج الحقيقية، يتم استبدال LocalStorage بطلب API (مثل Firebase أو MongoDB)
 */

const STORAGE_KEYS = {
  USERS: 'maham_global_users',
  SESSION: 'maham_global_session',
  USER_TASKS_PREFIX: 'maham_tasks_cloud_',
  USER_CATS_PREFIX: 'maham_cats_cloud_'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // جلب جميع المستخدمين من "السحابة"
  getUsers: async (): Promise<any[]> => {
    await delay(600); // محاكاة زمن استجابة السيرفر العالمي
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Cloud Database Error", error);
      return [];
    }
  },

  registerUser: async (userData: any): Promise<void> => {
    await delay(1200); // محاكاة إنشاء سجل في السيرفر العالمي
    const users = await storageService.getUsers();
    users.push(userData);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser: async (oldUsername: string, updatedData: Partial<User>): Promise<boolean> => {
    await delay(1000);
    const users = await storageService.getUsers();
    const index = users.findIndex(u => u.username === oldUsername);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedData };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      if (updatedData.username && updatedData.username !== oldUsername) {
        const tasks = localStorage.getItem(STORAGE_KEYS.USER_TASKS_PREFIX + oldUsername.toLowerCase());
        if (tasks) {
          localStorage.setItem(STORAGE_KEYS.USER_TASKS_PREFIX + updatedData.username.toLowerCase(), tasks);
          localStorage.removeItem(STORAGE_KEYS.USER_TASKS_PREFIX + oldUsername.toLowerCase());
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
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  clearSession: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getUserTasks: async (username: string): Promise<Task[]> => {
    await delay(500);
    const key = STORAGE_KEYS.USER_TASKS_PREFIX + username.toLowerCase();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveUserTasks: async (username: string, tasks: Task[]): Promise<void> => {
    // محاكاة المزامنة الخلفية مع السحابة
    const key = STORAGE_KEYS.USER_TASKS_PREFIX + username.toLowerCase();
    localStorage.setItem(key, JSON.stringify(tasks));
  },

  getUserCategories: async (username: string): Promise<Category[]> => {
    await delay(400);
    const key = STORAGE_KEYS.USER_CATS_PREFIX + username.toLowerCase();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },

  saveUserCategories: async (username: string, categories: Category[]): Promise<void> => {
    const key = STORAGE_KEYS.USER_CATS_PREFIX + username.toLowerCase();
    localStorage.setItem(key, JSON.stringify(categories));
  },

  initializeNewAccount: async (username: string): Promise<void> => {
    const welcomeTask: Task = {
      id: 'welcome-' + Date.now(),
      title: 'مرحباً بك في نظامك العالمي! 🌍',
      description: 'بياناتك الآن محفوظة في السحابة ومزامنة عبر جميع أجهزتك.',
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

    await storageService.saveUserTasks(username, [welcomeTask]);
    await storageService.saveUserCategories(username, DEFAULT_CATEGORIES);
  }
};
