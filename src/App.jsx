import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Canvasbuilder from "./shared/canvas"
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Canvasbuilder/>
    </>
  )
}

export default App
