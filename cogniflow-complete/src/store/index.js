import { create } from 'zustand';
import { authService } from '../services/auth';

export const useStore = create((set) => ({
  // Auth state
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  // Tasks state
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task._id === id ? { ...task, ...updates } : task
    )
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task._id !== id)
  })),

  // Schedule state
  schedule: null,
  setSchedule: (schedule) => set({ schedule }),

  // Insights state
  insights: null,
  setInsights: (insights) => set({ insights }),

  // Loading states
  loading: {
    tasks: false,
    schedule: false,
    insights: false,
    thoughts: false,
    reflections: false,
  },
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  })),
}));
