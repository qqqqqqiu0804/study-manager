import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import SubjectDetail from './pages/SubjectDetail'
import Tasks from './pages/Tasks'
import Knowledge from './pages/Knowledge'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/knowledge" element={<Knowledge />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
