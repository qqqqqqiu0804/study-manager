import { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import TaskItem from '../components/TaskItem'

const Tasks = () => {
  const { subjects, tasks, addTask } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    if (filterSubject !== 'all') {
      filtered = filtered.filter(t => t.subjectId === filterSubject)
    }

    if (filterStatus === 'completed') {
      filtered = filtered.filter(t => t.completed)
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(t => !t.completed)
    }

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [tasks, filterSubject, filterStatus])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.subjectId || !formData.title) return

    addTask({
      subjectId: formData.subjectId,
      title: formData.title,
      date: formData.date
    })

    setFormData({
      subjectId: '',
      title: '',
      date: new Date().toISOString().split('T')[0]
    })
    setShowForm(false)
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>✅ 任务管理</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + 添加任务
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>添加新任务</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>选择科目</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="input"
                required
              >
                <option value="">请选择科目</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>任务内容</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="例如：看线性代数速成课第1章"
                required
              />
            </div>
            <div className="form-group">
              <label>日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">添加</button>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filters">
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="input"
        >
          <option value="all">所有科目</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input"
        >
          <option value="all">所有状态</option>
          <option value="pending">未完成</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      <div className="card">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => <TaskItem key={task.id} task={task} />)
        ) : (
          <p className="empty-message">暂无任务</p>
        )}
      </div>
    </div>
  )
}

export default Tasks
