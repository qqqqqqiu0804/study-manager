import { useState, useMemo } from 'react'
import useStore from '../store/useStore'
import KnowledgeCard from '../components/KnowledgeCard'

const Knowledge = () => {
  const { subjects, knowledge } = useStore()
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const filteredKnowledge = useMemo(() => {
    let filtered = [...knowledge]

    if (filterSubject !== 'all') {
      filtered = filtered.filter(k => k.subjectId === filterSubject)
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(k => k.category === filterCategory)
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [knowledge, filterSubject, filterCategory])

  return (
    <div className="knowledge-page">
      <h1>📝 知识点库</h1>

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
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input"
        >
          <option value="all">所有分类</option>
          <option value="key">重点</option>
          <option value="hard">难点</option>
          <option value="error">易错点</option>
        </select>
      </div>

      <div className="knowledge-grid">
        {filteredKnowledge.length > 0 ? (
          filteredKnowledge.map(k => <KnowledgeCard key={k.id} knowledge={k} />)
        ) : (
          <p className="empty-message">暂无知识点，去科目详情页添加吧！</p>
        )}
      </div>
    </div>
  )
}

export default Knowledge
