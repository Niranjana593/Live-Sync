import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [versions, setversions] = useState({
    node: window.versions.node(),
    chrome: window.versions.chrome(),
    electron: window.versions.electron()
  })
  return (
    <>
      <h1>Hello World!, Welcome to my first Electron App</h1>
<ul>
        <li>
          **Chrome version:** {versions.chrome}
        </li>
        <li>
          **Node version:** {versions.node}
        </li>
        <li>
          **Electron version:** {versions.electron}
        </li>
      </ul>
    </>
  )
}

export default App
