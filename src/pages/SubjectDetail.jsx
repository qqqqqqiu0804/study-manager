import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useStore from '../store/useStore'
import TaskItem from '../components/TaskItem'
import KnowledgeCard from '../components/KnowledgeCard'

const SubjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { subjects, tasks, knowledge, addTask, addKnowledge } = useStore()
  const [activeTab, setActiveTab] = useState('tasks')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false)

  const subject = subjects.find(s => s.id === id)
  if (!subject) {
    return <div className="card">科目不存在</div>
  }

  const subjectTasks = tasks.filter(t => t.subjectId === id)
  const subjectKnowledge = knowledge.filter(k => k.subjectId === id)

  const [taskForm, setTaskForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [knowledgeForm, setKnowledgeForm] = useState({
    title: '',
    content: '',
    category: 'key'
  })

  const handleAddTask = (e) => {
    e.preventDefault()
    addTask({ subjectId: id, ...taskForm })
    setTaskForm({ title: '', date: new Date().toISOString().split('T')[0] })
    setShowTaskForm(false)
  }

  const handleAddKnowledge = (e) => {
    e.preventDefault()
    addKnowledge({ subjectId: id, ...knowledgeForm })
    setKnowledgeForm({ title: '', content: '', category: 'key' })
    setShowKnowledgeForm(false)
  }

  return (
    <div className="subject-detail">
      <button className="btn back-btn" onClick={() => navigate('/subjects')}>
        ← 返回
      </button>

      <div className="subject-header">
        <div className="subject-color-large" style={{ backgroundColor: subject.color }} />
        <div>
          <h1>{subject.name}</h1>
          <p>考试日期: {subject.examDate}</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          任务 ({subjectTasks.length})
        </button>
        <button
          className={`tab ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          知识点 ({subjectKnowledge.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div>
          <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>
            + 添加任务
          </button>

          {showTaskForm && (
            <div className="card" style={{ marginTop: '15px' }}>
              <form onSubmit={handleAddTask}>
                <div className="form-group">
                  <label>任务内容</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>日期</label>
                  <input
                    type="date"
                    value={taskForm.date}
                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">添加</button>
                  <button type="button" className="btn" onClick={() => setShowTaskForm(false)}>取消</button>
                </div>
              </form>
            </div>
          )}

          <div className="card" style={{ marginTop: '15px' }}>
            {subjectTasks.length > 0 ? (
              subjectTasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
              <p className="empty-message">暂无任务</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div>
          <button className="btn btn-primary" onClick={() => setShowKnowledgeForm(true)}>
            + 添加知识点
          </button>

          {showKnowledgeForm && (
            <div className="card" style={{ marginTop: '15px' }}>
              <form onSubmit={handleAddKnowledge}>
                <div className="form-group">
                  <label>标题</label>
                  <input
                    type="text"
                    value={knowledgeForm.title}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>内容</label>
                  <textarea
                    value={knowledgeForm.content}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, content: e.target.value })}
                    className="input"
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>分类</label>
                  <select
                    value={knowledgeForm.category}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, category: e.target.value })}
                    className="input"
                  >
                    <option value="key">重点</option>
                    <option value="hard">难点</option>
                    <option value="error">易错点</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">添加</button>
                  <button type="button" className="btn" onClick={() => setShowKnowledgeForm(false)}>取消</button>
                </div>
              </form>
            </div>
          )}

          <div className="knowledge-grid" style={{ marginTop: '15px' }}>
            {subjectKnowledge.length > 0 ? (
              subjectKnowledge.map(k => <KnowledgeCard key={k.id} knowledge={k} />)
            ) : (
              <p className="empty-message">暂无知识点</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SubjectDetail
