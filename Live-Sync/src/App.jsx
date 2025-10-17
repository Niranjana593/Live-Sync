import { useState } from 'react'
import Dragdrop from './components/dragdrop.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [versions, setversions] = useState({
    node: window.versions.node(),
    chrome: window.versions.chrome(),
    electron: window.versions.electron()
  })
  const [message, setmessage] = useState("")
  function sendDate(){
      window.versions.loadData('Hello world from Niranjan').then((result)=>{
        console.log(result);
        setmessage(result);
      })
  }
  return (
    <>
      <h1 className='flex justify-center items-center mb-10 text-3xl font-semibold pt-10'>Live File Sync</h1>
       <Dragdrop/>
      
    </>
  )
}

export default App
