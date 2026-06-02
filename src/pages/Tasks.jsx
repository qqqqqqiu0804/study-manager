import { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import TaskItem from '../components/TaskItem'

const parseSmartText = (text, defaultSubjectId) => {
  const lines = text.split('\n').filter(line => line.trim())
  const tasks = []
  let currentDate = new Date().toISOString().split('T')[0]

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // 匹配日期格式：6月2日、6.2、6-2、2026-06-02 等
    const datePatterns = [
      /(\d{1,2})月(\d{1,2})[日号]/,
      /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/,
      /(\d{1,2})[.-](\d{1,2})/
    ]

    let dateMatch = null
    let extractedDate = null

    for (const pattern of datePatterns) {
      dateMatch = trimmed.match(pattern)
      if (dateMatch) {
        if (dateMatch.length === 4) {
          // 2026-06-02 格式
          extractedDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`
        } else if (dateMatch.length === 3) {
          // 6月2日 或 6.2 格式
          const month = dateMatch[1].padStart(2, '0')
          const day = dateMatch[2].padStart(2, '0')
          const year = new Date().getFullYear()
          extractedDate = `${year}-${month}-${day}`
        }
        break
      }
    }

    if (extractedDate) {
      currentDate = extractedDate
      // 提取日期后面的任务内容
      const taskContent = trimmed.replace(dateMatch[0], '').replace(/^[：:、\-\s]+/, '').trim()
      if (taskContent) {
        tasks.push({
          subjectId: defaultSubjectId,
          title: taskContent,
          date: currentDate
        })
      }
    } else {
      // 没有日期，使用当前日期
      tasks.push({
        subjectId: defaultSubjectId,
        title: trimmed.replace(/^[、\-\s]+/, '').trim(),
        date: currentDate
      })
    }
  }

  return tasks
}

const Tasks = () => {
  const { subjects, tasks, addTask } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [showSmartAdd, setShowSmartAdd] = useState(false)
  const [smartText, setSmartText] = useState('')
  const [smartSubjectId, setSmartSubjectId] = useState('')
  const [parsedTasks, setParsedTasks] = useState([])
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

  const handleSmartParse = () => {
    if (!smartSubjectId || !smartText.trim()) return
    const parsed = parseSmartText(smartText, smartSubjectId)
    setParsedTasks(parsed)
  }

  const handleSmartAdd = () => {
    parsedTasks.forEach(task => addTask(task))
    setSmartText('')
    setParsedTasks([])
    setShowSmartAdd(false)
  }

  const toggleParsedTask = (index) => {
    setParsedTasks(prev => prev.map((task, i) =>
      i === index ? { ...task, disabled: !task.disabled } : task
    ))
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>✅ 任务管理</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + 添加任务
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSmartAdd(true)}>
            📝 智能添加
          </button>
        </div>
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

      {showSmartAdd && (
        <div className="card smart-add-card">
          <h3>📝 智能添加任务</h3>
          <p className="smart-add-desc">
            粘贴一长串任务文字，自动识别日期和任务内容。支持格式：
            <br />• 6月2日 复习语法基础
            <br />• 6.2 复习流程控制
            <br />• 2026-06-02 复习数组
            <br />• 没有日期的行会自动使用上一个日期
          </p>

          <div className="form-group">
            <label>选择科目</label>
            <select
              value={smartSubjectId}
              onChange={(e) => setSmartSubjectId(e.target.value)}
              className="input"
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
            <label>粘贴任务文字</label>
            <textarea
              value={smartText}
              onChange={(e) => setSmartText(e.target.value)}
              className="input smart-textarea"
              placeholder="例如：&#10;6月2日 复习语法基础&#10;6月3日 复习流程控制&#10;6月4日 复习数组和字符串"
              rows="8"
            />
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleSmartParse}
              disabled={!smartSubjectId || !smartText.trim()}
            >
              解析预览
            </button>
            <button className="btn" onClick={() => {
              setShowSmartAdd(false)
              setSmartText('')
              setParsedTasks([])
            }}>
              取消
            </button>
          </div>

          {parsedTasks.length > 0 && (
            <div className="parsed-preview">
              <h4>预览（点击可取消添加）</h4>
              <div className="parsed-list">
                {parsedTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`parsed-item ${task.disabled ? 'disabled' : ''}`}
                    onClick={() => toggleParsedTask(index)}
                  >
                    <span className="parsed-date">{task.date}</span>
                    <span className="parsed-title">{task.title}</span>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleSmartAdd}>
                  ✅ 添加 {parsedTasks.filter(t => !t.disabled).length} 个任务
                </button>
              </div>
            </div>
          )}
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
