import { useState } from 'react'
import Dragdrop from './components/dragdrop.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [message, setmessage] = useState("")
  return ( 
    <>
      <div className='bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]">'>
        <h1 className='flex text-white justify-center items-center mb-10 text-3xl font-semibold pt-10'>Live File Sync</h1>
        <Dragdrop/>
      </div>
      
    </>
  )
}

export default App
