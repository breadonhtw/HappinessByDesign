import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VotingPage from './pages/VotingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VotingPage />} />
        <Route path="/vote" element={<VotingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
