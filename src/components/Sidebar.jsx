import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const VERSION = '1.2.0'

const changelog = [
  {
    version: '1.2.0',
    date: '2026-06-02',
    changes: [
      '新增知识点智能导入功能',
      '支持上传 .txt、.md、.docx 文件导入',
      '自动识别标题层级并拆分知识点',
      '智能分类标记（重点/难点/易错）'
    ]
  },
  {
    version: '1.1.0',
    date: '2026-06-02',
    changes: [
      '新增智能批量添加任务功能',
      '支持粘贴一长串文字自动识别任务',
      '支持多种日期格式（6月2日、6.2、2026-06-02）'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-06-01',
    changes: [
      '初始版本发布',
      '仪表盘：考试倒计时、今日任务、复习进度',
      '科目管理：预设5门课程',
      '任务管理：添加、完成、删除任务',
      '知识点库：分类管理重点、难点、易错点',
      '响应式设计：支持手机和电脑访问',
      '数据本地存储：localStorage自动保存'
    ]
  }
]

const Sidebar = ({ isOpen, onClose }) => {
  const [showChangelog, setShowChangelog] = useState(false)

  const menuItems = [
    { path: '/', label: '仪表盘', icon: '📊' },
    { path: '/subjects', label: '科目管理', icon: '📚' },
    { path: '/tasks', label: '任务管理', icon: '✅' },
    { path: '/knowledge', label: '知识点库', icon: '📝' }
  ]

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>📚 复习管理</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="version-btn"
            onClick={() => setShowChangelog(true)}
          >
            📌 v{VERSION} 更新日志
          </button>
        </div>
      </aside>

      {showChangelog && (
        <div className="modal-overlay" onClick={() => setShowChangelog(false)}>
          <div className="modal-content changelog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📌 更新日志</h3>
              <button className="modal-close" onClick={() => setShowChangelog(false)}>×</button>
            </div>
            <div className="changelog-list">
              {changelog.map((log, index) => (
                <div key={index} className="changelog-item">
                  <div className="changelog-header">
                    <span className="changelog-version">v{log.version}</span>
                    <span className="changelog-date">{log.date}</span>
                  </div>
                  <ul className="changelog-changes">
                    {log.changes.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
