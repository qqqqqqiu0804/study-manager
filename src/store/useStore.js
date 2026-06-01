import { create } from 'zustand'
import { storage, STORAGE_KEYS } from '../utils/storage'

const defaultSubjects = [
  {
    id: 'subject-1',
    name: '英语四级',
    examDate: '2026-06-13',
    priority: 'high',
    color: '#3b82f6',
    createdAt: new Date().toISOString()
  },
  {
    id: 'subject-2',
    name: '线性代数',
    examDate: '2026-06-20',
    priority: 'medium',
    color: '#10b981',
    createdAt: new Date().toISOString()
  },
  {
    id: 'subject-3',
    name: '离散数学',
    examDate: '2026-06-22',
    priority: 'medium',
    color: '#f59e0b',
    createdAt: new Date().toISOString()
  },
  {
    id: 'subject-4',
    name: '高等数学',
    examDate: '2026-06-25',
    priority: 'medium',
    color: '#ef4444',
    createdAt: new Date().toISOString()
  },
  {
    id: 'subject-5',
    name: 'Java',
    examDate: '2026-06-28',
    priority: 'medium',
    color: '#8b5cf6',
    createdAt: new Date().toISOString()
  }
]

const useStore = create((set, get) => ({
  subjects: storage.get(STORAGE_KEYS.SUBJECTS) || defaultSubjects,
  tasks: storage.get(STORAGE_KEYS.TASKS) || [],
  knowledge: storage.get(STORAGE_KEYS.KNOWLEDGE) || [],

  // 科目操作
  addSubject: (subject) => {
    const newSubject = {
      ...subject,
      id: `subject-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    set((state) => {
      const newSubjects = [...state.subjects, newSubject]
      storage.set(STORAGE_KEYS.SUBJECTS, newSubjects)
      return { subjects: newSubjects }
    })
  },

  updateSubject: (id, updates) => {
    set((state) => {
      const newSubjects = state.subjects.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
      storage.set(STORAGE_KEYS.SUBJECTS, newSubjects)
      return { subjects: newSubjects }
    })
  },

  deleteSubject: (id) => {
    set((state) => {
      const newSubjects = state.subjects.filter(s => s.id !== id)
      const newTasks = state.tasks.filter(t => t.subjectId !== id)
      const newKnowledge = state.knowledge.filter(k => k.subjectId !== id)
      storage.set(STORAGE_KEYS.SUBJECTS, newSubjects)
      storage.set(STORAGE_KEYS.TASKS, newTasks)
      storage.set(STORAGE_KEYS.KNOWLEDGE, newKnowledge)
      return { subjects: newSubjects, tasks: newTasks, knowledge: newKnowledge }
    })
  },

  // 任务操作
  addTask: (task) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString()
    }
    set((state) => {
      const newTasks = [...state.tasks, newTask]
      storage.set(STORAGE_KEYS.TASKS, newTasks)
      return { tasks: newTasks }
    })
  },

  updateTask: (id, updates) => {
    set((state) => {
      const newTasks = state.tasks.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
      storage.set(STORAGE_KEYS.TASKS, newTasks)
      return { tasks: newTasks }
    })
  },

  toggleTask: (id) => {
    set((state) => {
      const newTasks = state.tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
      storage.set(STORAGE_KEYS.TASKS, newTasks)
      return { tasks: newTasks }
    })
  },

  deleteTask: (id) => {
    set((state) => {
      const newTasks = state.tasks.filter(t => t.id !== id)
      storage.set(STORAGE_KEYS.TASKS, newTasks)
      return { tasks: newTasks }
    })
  },

  // 知识点操作
  addKnowledge: (knowledge) => {
    const newKnowledge = {
      ...knowledge,
      id: `knowledge-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    set((state) => {
      const newKnowledgeList = [...state.knowledge, newKnowledge]
      storage.set(STORAGE_KEYS.KNOWLEDGE, newKnowledgeList)
      return { knowledge: newKnowledgeList }
    })
  },

  updateKnowledge: (id, updates) => {
    set((state) => {
      const newKnowledgeList = state.knowledge.map(k =>
        k.id === id ? { ...k, ...updates } : k
      )
      storage.set(STORAGE_KEYS.KNOWLEDGE, newKnowledgeList)
      return { knowledge: newKnowledgeList }
    })
  },

  deleteKnowledge: (id) => {
    set((state) => {
      const newKnowledgeList = state.knowledge.filter(k => k.id !== id)
      storage.set(STORAGE_KEYS.KNOWLEDGE, newKnowledgeList)
      return { knowledge: newKnowledgeList }
    })
  },

  // 数据导出
  exportData: () => {
    const { subjects, tasks, knowledge } = get()
    const data = { subjects, tasks, knowledge, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `study-manager-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  // 数据导入
  importData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      if (data.subjects && data.tasks && data.knowledge) {
        storage.set(STORAGE_KEYS.SUBJECTS, data.subjects)
        storage.set(STORAGE_KEYS.TASKS, data.tasks)
        storage.set(STORAGE_KEYS.KNOWLEDGE, data.knowledge)
        set({
          subjects: data.subjects,
          tasks: data.tasks,
          knowledge: data.knowledge
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Import failed:', error)
      return false
    }
  }
}))

export default useStore
