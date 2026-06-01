const CountdownTimer = ({ examDate, subjectName }) => {
  const calculateDaysLeft = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate)
    exam.setHours(0, 0, 0, 0)
    const diffTime = exam - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysLeft = calculateDaysLeft()

  const getStatusColor = () => {
    if (daysLeft <= 3) return 'var(--danger)'
    if (daysLeft <= 7) return 'var(--warning)'
    return 'var(--success)'
  }

  return (
    <div className="countdown-card" style={{ borderLeft: `4px solid ${getStatusColor()}` }}>
      <div className="countdown-info">
        <h3>{subjectName}</h3>
        <p className="exam-date">考试日期: {examDate}</p>
      </div>
      <div className="countdown-days" style={{ color: getStatusColor() }}>
        <span className="days-number">{daysLeft}</span>
        <span className="days-label">天</span>
      </div>
    </div>
  )
}

export default CountdownTimer
