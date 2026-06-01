import useStore from '../store/useStore'

const TaskItem = ({ task }) => {
  const { toggleTask, deleteTask, subjects } = useStore()
  const subject = subjects.find(s => s.id === task.subjectId)

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
        className="task-checkbox"
      />
      <div className="task-content">
        <p className="task-title">{task.title}</p>
        <p className="task-date">
          {subject && <span style={{ color: subject.color, marginRight: '8px' }}>{subject.name}</span>}
          {task.date}
        </p>
      </div>
      <button
        onClick={() => deleteTask(task.id)}
        className="task-delete"
      >
        ×
      </button>
    </div>
  )
}

export default TaskItem
