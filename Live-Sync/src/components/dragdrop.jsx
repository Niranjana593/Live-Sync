import React, { useState } from 'react'
import { FileUploader } from "react-drag-drop-files";
const Dragdrop = () => {
  const [files, setFiles] = useState([])
  const [sourcefile, setsourcefile] = useState("");
  const [destinationfile, setdestinationfile] = useState("");
  async function selectSource() {
    const path = await window.versions.selectSource();
    if (path) setsourcefile(path);
    else setsourcefile('No file selected');
  };
  async function selectDestination() {
    const path = await window.versions.selectDestination();
    if (path) setdestinationfile(path);
    else setdestinationfile('No file selected');
  };
  async function startSync(){
    let response=await window.versions.startSync();
    alert(response);
  }
  return (
    <>
      <div className='fileupload justify-center   flex w-100vw  gap-10'>
        <div className="flex flex-col justify-center border-2 border-dotted items-center source w-[30%]  h-50 bg-gray-100 rounded-lg font-light">
          <h1>Drag and Drop Your source file here</h1>
          <img className='cursor-pointer' onClick={selectSource} width={50} height={50} src="/file.png" alt="" />
          <h1>Source file:{sourcefile}</h1>
        </div>
        <div className="flex flex-col justify-center border-2 border-dotted items-center source w-[30%]  h-50 bg-gray-100 rounded-lg font-light">
          <h1>Drag and Drop Your Destination file here</h1>
          <img className='cursor-pointer' onClick={selectDestination} width={50} height={50} src="/file.png" alt="" />
          <h1>Destination file:{destinationfile}</h1>
        </div>
      </div>
      <div className='flex justify-center m-auto mt-5 h-[50px] items-center w-50 text-center '>
        <button onClick={startSync} type="button" className="text-white bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center me-2 mb-2">Start Sync</button>
      </div>
    </>

  )
}

export default Dragdrop
