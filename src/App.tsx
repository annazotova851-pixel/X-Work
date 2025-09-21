import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { App as AntApp } from 'antd'
import Layout from './components/Layout'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import References from './pages/References'
import { ProjectsProvider } from './contexts/ProjectsContext'

function App() {
  return (
    <AntApp>
      <ProjectsProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/references/:type" element={<References />} />
            </Routes>
          </Layout>
        </Router>
      </ProjectsProvider>
    </AntApp>
  )
}

export default App
