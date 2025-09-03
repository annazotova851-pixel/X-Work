import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AdditionalWorks from './pages/AdditionalWorks'
import References from './pages/References'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/additional-works" element={<AdditionalWorks />} />
          <Route path="/references" element={<References />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
