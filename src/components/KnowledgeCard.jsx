import useStore from '../store/useStore'

const KnowledgeCard = ({ knowledge }) => {
  const { deleteKnowledge } = useStore()

  const getCategoryLabel = (category) => {
    const labels = {
      key: '重点',
      hard: '难点',
      error: '易错'
    }
    return labels[category] || category
  }

  const getCategoryColor = (category) => {
    const colors = {
      key: 'var(--primary)',
      hard: 'var(--warning)',
      error: 'var(--danger)'
    }
    return colors[category] || 'var(--gray-500)'
  }

  return (
    <div className="knowledge-card">
      <div className="knowledge-header">
        <span
          className="knowledge-category"
          style={{ backgroundColor: getCategoryColor(knowledge.category) }}
        >
          {getCategoryLabel(knowledge.category)}
        </span>
        <button
          onClick={() => deleteKnowledge(knowledge.id)}
          className="knowledge-delete"
        >
          ×
        </button>
      </div>
      <h3 className="knowledge-title">{knowledge.title}</h3>
      <p className="knowledge-content">{knowledge.content}</p>
    </div>
  )
}

export default KnowledgeCard
