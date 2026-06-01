import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

const Subjects = () => {
  const { subjects, tasks } = useStore()

  const getSubjectStats = (subjectId) => {
    const subjectTasks = tasks.filter(t => t.subjectId === subjectId)
    const completed = subjectTasks.filter(t => t.completed).length
    return { total: subjectTasks.length, completed }
  }

  return (
    <div className="subjects-page">
      <h1>📚 科目管理</h1>
      <div className="subjects-grid">
        {subjects.map(subject => {
          const stats = getSubjectStats(subject.id)
          return (
            <Link
              key={subject.id}
              to={`/subjects/${subject.id}`}
              className="subject-card"
            >
              <div className="subject-color" style={{ backgroundColor: subject.color }} />
              <div className="subject-info">
                <h3>{subject.name}</h3>
                <p className="subject-exam">考试: {subject.examDate}</p>
                <div className="subject-stats">
                  <span>任务: {stats.completed}/{stats.total}</span>
                  <span className={`priority priority-${subject.priority}`}>
                    {subject.priority === 'high' ? '高' : subject.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Subjects
