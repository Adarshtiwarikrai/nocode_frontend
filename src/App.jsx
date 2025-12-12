import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Floweditor from "./shared/canvas"
import { ReactFlowProvider } from '@xyflow/react'
import { ProjectList } from './components/shared/project-list'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  
    <ProjectList/>

     
    </>
  )
}

export default App
