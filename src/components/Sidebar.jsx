import { NavLink } from 'react-router-dom'

const Sidebar = ({ isOpen, onClose }) => {
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
      </aside>
    </>
  )
}

export default Sidebar
