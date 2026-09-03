import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
    .then(res => setStatus(res.data.status))
    .catch(err => setStatus('Backend Off'))
  }, [])

  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-3xl font-bold">SkillSwap Backend: {status}</h1>
    </div>
  )
}
export default App