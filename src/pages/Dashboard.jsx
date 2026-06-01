import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'
import CountdownTimer from '../components/CountdownTimer'
import TaskItem from '../components/TaskItem'

const Dashboard = () => {
  const { subjects, tasks } = useStore()

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
  }, [subjects])

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.date === today && !t.completed)
  }, [tasks, today])

  const subjectProgress = useMemo(() => {
    return subjects.map(subject => {
      const subjectTasks = tasks.filter(t => t.subjectId === subject.id)
      const completedTasks = subjectTasks.filter(t => t.completed)
      const progress = subjectTasks.length > 0
        ? Math.round((completedTasks.length / subjectTasks.length) * 100)
        : 0
      return { ...subject, progress, total: subjectTasks.length, completed: completedTasks.length }
    })
  }, [subjects, tasks])

  return (
    <div className="dashboard">
      <h1>📊 仪表盘</h1>

      <section className="section">
        <h2>⏰ 考试倒计时</h2>
        <div className="countdown-grid">
          {sortedSubjects.map(subject => (
            <CountdownTimer
              key={subject.id}
              examDate={subject.examDate}
              subjectName={subject.name}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <h2>📋 今日任务</h2>
        <div className="card">
          {todayTasks.length > 0 ? (
            todayTasks.map(task => <TaskItem key={task.id} task={task} />)
          ) : (
            <p className="empty-message">今天没有任务，去添加一些吧！</p>
          )}
          <Link to="/tasks" className="btn btn-primary" style={{ marginTop: '15px' }}>
            查看所有任务
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>📈 复习进度</h2>
        <div className="progress-grid">
          {subjectProgress.map(subject => (
            <div key={subject.id} className="progress-card">
              <div className="progress-header">
                <h3>{subject.name}</h3>
                <span className="progress-text">{subject.completed}/{subject.total}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
              <p className="progress-percent">{subject.progress}%</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
