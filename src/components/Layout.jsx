import { useState } from 'react'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app">
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
