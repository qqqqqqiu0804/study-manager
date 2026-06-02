import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import NotificationReminder from './components/NotificationReminder'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import SubjectDetail from './pages/SubjectDetail'
import Tasks from './pages/Tasks'
import Knowledge from './pages/Knowledge'
import Statistics from './pages/Statistics'

function App() {
  return (
    <Router>
      <Layout>
        <NotificationReminder />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
