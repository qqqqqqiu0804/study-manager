const STORAGE_KEYS = {
  SUBJECTS: 'study_manager_subjects',
  TASKS: 'study_manager_tasks',
  KNOWLEDGE: 'study_manager_knowledge'
}

export const storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  }
}

export { STORAGE_KEYS }
