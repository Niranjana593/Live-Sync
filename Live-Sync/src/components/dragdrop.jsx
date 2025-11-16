import React, { useState } from 'react'
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { FileUploader } from "react-drag-drop-files";
const Dragdrop = () => {
  const [sourcefile, setsourcefile] = useState("");
  const [destinationfile, setdestinationfile] = useState("");
  const [Syncstarted, setSyncstarted] = useState(false);
  const [logs, setlogs] = useState([]);
  useEffect(() => {
    window.versions.onSyncStatus((message) => {
      setlogs((prevLogs) => [...prevLogs, message]);
    });
  }, []);

  useEffect(() => {
    console.log(logs);
  }, [logs])
  
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
  async function OpenVsCode()
  {
    if(!sourcefile || !destinationfile) {
      alert('Please select both source and destination files');
      return;
    }
    if(Syncstarted===false){
       alert('Please start syncing the file before opening the file in VS Code');
    }
    let response=await window.versions.OpenVSCode(sourcefile);
    toast('Opening the source file in VS Code....');
    if(response==="Failed to open VS Code"){
       alert('Filed to open VS Code.Please ensoure VS Code installed in your system and installed that "code" command is available in your PATH.');
    }
    else{
      console.log(response);
      
    }
  }
  async function startSync(){
    toast('Syncing of the file has started.....', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });

    if(!sourcefile || !destinationfile) {
      alert('Please select both source and destination files');
      return;
    }
    if(sourcefile === destinationfile){
      alert('Source and destination file cannot be same');
      return;
    }
    setSyncstarted(true);
    setlogs([]); // Clear previous logs
    let response = await window.versions.startSync();
    console.log(response);
    if(response === "permission denied"){
      alert('Selected File does not have read/write permissions');
    }
  }

  return (
    <>
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"

    />
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
      <div className='flex flex-col justify-center m-auto mt-10  items-center text-center '>
        <button onClick={startSync} type="button" className="text-white bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center me-2 mb-2">Start Sync</button>
        <button onClick={startSync} type="button" className="text-white bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center me-2 mb-2">Stop Sync</button>
        <button onClick={OpenVsCode} type="button" className="text-white bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center me-2 mb-2">Open Source File in VS Code</button>
      </div>
      <div className="mt-8 mx-auto max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Sync Logs</h2>
        <div className="border rounded-lg p-4 bg-gray-50 min-h-[100px] max-h-[300px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center">No logs yet</p>
          ) : (
            logs.map((message, i) => (
              i%4===0 ?<p key={i} className={`py-1 border-b last:border-0 ${i % 2 === 0 ? 'bg-gray-100' : ''}`}>
                {message}
              </p>:null
            ))
          )}
        </div>
      </div>
    </>

  )
}

export default Dragdrop
