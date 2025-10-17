import React, { useState } from 'react'
import { FileUploader } from "react-drag-drop-files";
const Dragdrop = () => {
  const [files, setFiles] = useState([])
  function handleDragover(e){
    e.preventDefault();
  }
  function handleDrop(e){
    e.preventDefault();
  }

  return (
    <>
        <div className='fileupload justify-center  flex w-100vw  gap-10'>
          <div className="flex flex-col justify-center items-center source w-[50%]  border-w h-30 bg-gray-100 rounded-lg font-light">
            <h1>Drag and Drop Your source file here</h1>
            <label htmlFor="sorce">Click Here to browse
            </label>
            <input  id='source' type="file" />
            <h1></h1>
          </div>
           <div className="flex flex-col justify-center items-center source w-[50%]  h-30 bg-gray-100 rounded-lg font-light">
            <h1>Drag and Drop Your Destination file here</h1>
            <label htmlFor="sorce">Click Here to browse
            </label>
            <input  id='source' type="file" />
            <h1></h1>
          </div>
        </div>
    </>
    
  )
}

export default Dragdrop
