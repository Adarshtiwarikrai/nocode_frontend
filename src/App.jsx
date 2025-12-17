import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { ReactFlowProvider } from '@xyflow/react'
import { ProjectList } from './components/shared/project-list'
import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/shared/login'
import RegisterPage from './components/shared/register'
import ProjectsPage from './shared/page/project'
import ProjectDetailPage from './shared/page/projectbuild'
import ToolsPage from './shared/page/tools'
import Page from './shared/page/toolspage'
import { Editor } from './shared/page/resize'
import ProjectResize from './shared/page/projectresize'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  
  <div className="flex flex-col h-screen">
        
        <main className="flex-1 overflow-hidden">
          <Routes>
           
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectResize />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/:id" element={<Page />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/" element={<RegisterPage />} />
           
          </Routes>
        </main>
     
      </div>

     
    </>
  )
}

export default App
