import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DiabetesForm from './DiabateseForm.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <DiabetesForm />
    </div>
  )
}

export default App
