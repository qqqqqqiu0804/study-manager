import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import useStore from '../store/useStore'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const Statistics = () => {
  const { subjects, tasks, knowledge } = useStore()
  const [timeRange, setTimeRange] = useState('week')

  // 获取过去N天的日期数组
  const getPastDays = (n) => {
    const days = []
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  // 每日完成任务数
  const dailyCompletedTasks = useMemo(() => {
    const days = timeRange === 'week' ? getPastDays(7) : getPastDays(30)
    return days.map(date => {
      const count = tasks.filter(t => t.completed && t.createdAt.startsWith(date)).length
      return {
        date: date.slice(5), // MM-DD
        count
      }
    })
  }, [tasks, timeRange])

  // 每日新增任务数
  const dailyNewTasks = useMemo(() => {
    const days = timeRange === 'week' ? getPastDays(7) : getPastDays(30)
    return days.map(date => {
      const count = tasks.filter(t => t.createdAt.startsWith(date)).length
      return {
        date: date.slice(5),
        count
      }
    })
  }, [tasks, timeRange])

  // 各科目任务统计
  const subjectStats = useMemo(() => {
    return subjects.map(subject => {
      const subjectTasks = tasks.filter(t => t.subjectId === subject.id)
      const completed = subjectTasks.filter(t => t.completed).length
      return {
        name: subject.name,
        total: subjectTasks.length,
        completed,
        pending: subjectTasks.length - completed,
        color: subject.color
      }
    })
  }, [subjects, tasks])

  // 各科目知识点统计
  const knowledgeStats = useMemo(() => {
    return subjects.map(subject => {
      const count = knowledge.filter(k => k.subjectId === subject.id).length
      return {
        name: subject.name,
        count,
        color: subject.color
      }
    }).filter(s => s.count > 0)
  }, [subjects, knowledge])

  // 知识点分类统计
  const categoryStats = useMemo(() => {
    const keyCount = knowledge.filter(k => k.category === 'key').length
    const hardCount = knowledge.filter(k => k.category === 'hard').length
    const errorCount = knowledge.filter(k => k.category === 'error').length
    return [
      { name: '重点', value: keyCount, color: '#3b82f6' },
      { name: '难点', value: hardCount, color: '#f59e0b' },
      { name: '易错', value: errorCount, color: '#ef4444' }
    ].filter(s => s.value > 0)
  }, [knowledge])

  // 总体统计
  const totalStats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const totalKnowledge = knowledge.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      totalKnowledge,
      completionRate
    }
  }, [tasks, knowledge])

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>📊 学习统计</h1>
        <div className="time-range-selector">
          <button
            className={`btn ${timeRange === 'week' ? 'btn-primary' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            近7天
          </button>
          <button
            className={`btn ${timeRange === 'month' ? 'btn-primary' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            近30天
          </button>
        </div>
      </div>

      {/* 总体统计卡片 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{totalStats.totalTasks}</div>
            <div className="stat-label">总任务数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{totalStats.completedTasks}</div>
            <div className="stat-label">已完成</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{totalStats.pendingTasks}</div>
            <div className="stat-label">待完成</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{totalStats.totalKnowledge}</div>
            <div className="stat-label">知识点</div>
          </div>
        </div>
      </div>

      {/* 完成率 */}
      <div className="card completion-rate-card">
        <h3>总体完成率</h3>
        <div className="completion-rate">
          <div className="rate-circle">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${totalStats.completionRate * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="rate-text">{totalStats.completionRate}%</div>
          </div>
          <div className="rate-details">
            <p>已完成 {totalStats.completedTasks} / {totalStats.totalTasks} 个任务</p>
            <p>继续加油！💪</p>
          </div>
        </div>
      </div>

      {/* 每日任务完成趋势 */}
      <div className="card">
        <h3>每日任务完成趋势</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyCompletedTasks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 各科目任务统计 */}
      <div className="card">
        <h3>各科目任务统计</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" name="已完成" stackId="a" />
              <Bar dataKey="pending" fill="#e5e7eb" name="待完成" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 知识点分布 */}
      <div className="stats-row">
        <div className="card">
          <h3>知识点科目分布</h3>
          {knowledgeStats.length > 0 ? (
            <div className="knowledge-list">
              {knowledgeStats.map((stat, index) => (
                <div key={index} className="knowledge-stat-item">
                  <div className="knowledge-stat-name">
                    <span className="color-dot" style={{ backgroundColor: stat.color }}></span>
                    {stat.name}
                  </div>
                  <div className="knowledge-stat-count">{stat.count} 个</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">暂无知识点数据</p>
          )}
        </div>

        <div className="card">
          <h3>知识点分类分布</h3>
          {categoryStats.length > 0 ? (
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}`}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-message">暂无知识点数据</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Statistics
