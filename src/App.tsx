import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import { ProjectsProvider } from './contexts/ProjectsContext'

function App() {
  return (
    <ProjectsProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
          </Routes>
        </Layout>
      </Router>
    </ProjectsProvider>
  )
}

export default App
