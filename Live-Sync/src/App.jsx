import { useState } from 'react'
import Dragdrop from './components/dragdrop.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [message, setmessage] = useState("")
  return ( 
    <>
      <h1 className='flex justify-center items-center mb-10 text-3xl font-semibold pt-10'>Live File Sync</h1>
       <Dragdrop/>
      
    </>
  )
}

export default App
