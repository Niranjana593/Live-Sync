import { useState } from 'react'
import Dragdrop from './components/dragdrop.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [message, setmessage] = useState("")
  return ( 
    <>
      <div className="bg-[url('public/17973908.jpg')] h-screen w-screen bg-cover bg-center fixed -z-10">
      {/* <img className='text-white' src="public/17973908.jpg" alt="Backgroung image" /> */}
        <h1 className='flex text-black justify-center items-center mb-10 text-3xl font-semibold pt-10'>Live File Sync</h1>
        <Dragdrop/>
      </div>
      
    </>
  )
}

export default App
