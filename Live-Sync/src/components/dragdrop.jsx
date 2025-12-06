import React, { useState,useRef } from 'react'
import { useEffect } from 'react';
import Swal from 'sweetalert2'
import 'sweetalert2/themes/bulma.css'
import 'sweetalert2/themes/bootstrap-4.css'
// Import images as assets so Vite bundles them with correct paths
const createrImg = new URL('../../public/creater.png', import.meta.url).href;
const fileImg = new URL('../../public/file.png', import.meta.url).href;
const crossImg = new URL('../../public/image.png', import.meta.url).href;
import { ToastContainer, toast } from 'react-toastify';
import { FileUploader } from "react-drag-drop-files";
const Dragdrop = () => {
  const [sourcefile, setsourcefile] = useState(localStorage.getItem('sourcefile') || "Create a temporary source file");
  const [destinationfile, setdestinationfile] = useState(localStorage.getItem('destinationfile') || "Select the destination file");
  const [disable, setdisable] = useState(true)
  const [Syncstarted, setSyncstarted] = useState(false);
  const file = useRef(null)
  const [logs, setlogs] = useState(()=>{
    const saved=localStorage.getItem('Sync-logs');
    if(saved){
      return JSON.parse(saved);
    }
    else{
      return [];
    }
  });
  useEffect(() => {
    window.versions.onSyncStatus((message) => {
      setlogs((prevLogs) => {
        const updated=[...prevLogs,message];
        localStorage.setItem('Sync-message',JSON.stringify(updated));
        return updated;
      });
      
    });
  }, []);
  async function handleclick(){
     
     setdisable(!disable);
  }
  async function getTemporaryFile(){
    if(!file.current.value.includes('.'))
    {
      // alert('Please provide a valid file name with extension');
      Swal.fire({
        title: 'Warning!',
        text: 'Please provide a valid file name with extension',
        icon: 'warning',
        confirmButtonText: 'OK!',
        theme:'bulma'
      })
      return;
    }
     setsourcefile(file.current.value);
     let response=await window.versions.CreateFile(file.current.value);
     toast("Temporary file created successfully");
     localStorage.setItem('sourcefile',file.current.value);
     setdisable(true);
  }
  async function selectDestination() {
    const path = await window.versions.selectDestination();
    localStorage.setItem('destinationfile',path);
    if (path) setdestinationfile(path);
    else setdestinationfile('No file selected');
  };
  async function OpenVsCode()
  {
    if(!sourcefile || !destinationfile) {
      // alert('Please select both source and destination files');
      Swal.fire({
        title: 'Warning!',
        text: 'Please select both source and destination files',
        icon: 'warning',
        confirmButtonText: 'OK!',
        theme:'bootstrap-4'
      })
      return;
    }
    if(Syncstarted===false){
      //  alert('Please start syncing the file before opening the file in VS Code');
      Swal.fire({
        title: 'Warning!',
        text: 'Please start syncing the files before opening the file in VS Code',
        icon: 'warning',
        confirmButtonText: 'OK!',
        theme:'bulma'
      })
      return;
    }
    let response=await window.versions.OpenVSCode(sourcefile);
    toast('Opening the source file in VS Code....');
    if(response==="Failed to open VS Code"){
       alert('Filed to open VS Code.Please ensoure VS Code installed in your system and installed that "code" command is available in your PATH.');
    }
    else{
      
    }
  }
  async function stopsync(){
    console.log(sourcefile);
    try {
      const respone=await window.versions.StopWatcher();
      const res = await window.versions.StopSync(sourcefile);
      
      if (res && res.ok) {
        toast(res.message || 'Sync stopped and file deleted', {
          position: 'top-right',
          autoClose: 3000,
          type: 'success',
        });
      } else {
        toast(`Error: ${res?.error || 'Failed to stop sync'}`, {
          position: 'top-right',
          autoClose: 5000,
          type: 'error',
        });
      }
    } catch (err) {
      console.error('stopsync error:', err);
      toast('Error stopping sync', {
        position: 'top-right',
        autoClose: 5000,
        type: 'error',
      });
    }

    // Reset state regardless of success/failure
    setSyncstarted(false);
    setsourcefile('Create a temporary source file');
    setdestinationfile('Select the destination file');
    setlogs([]); // Clear logs in state first
    
    // Clear localStorage after state updates
    try {
      localStorage.removeItem('sourcefile');
      localStorage.removeItem('destinationfile');
      localStorage.removeItem('Sync-logs');
      localStorage.removeItem('Sync-message');
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }
  }
  async function createfile(){
     setdisable(false);
  }
  async function startSync(){
    if(sourcefile==="Select Source File" || destinationfile==="Select the destination file") {
      // alert('Please select both source and destination files');
      Swal.fire({
        title: 'Warning!',
        text: 'Please select both source and destination files',
        icon: 'warning',
        confirmButtonText: 'OK!',
        theme:'bulma'
      })
      return;
    }
    if(sourcefile===destinationfile) {
      alert('Source and destination file cannot be same');
      return;
    }
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
    setSyncstarted(true);
    setlogs([]); // Clear previous logs
    let response = await window.versions.startSync(sourcefile);
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
    
    {/* Main container with responsive padding */}
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      
      {/* File selection cards - responsive grid */}
      <div className='flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-10 mb-8'>
        {/* Source file card */}
        <div className="bg-[#edd687] flex flex-col justify-center border-2 border-dotted items-center w-full sm:w-[45%] lg:w-[30%] h-40 sm:h-48 rounded-lg font-light shadow-md hover:shadow-lg transition-shadow">
          <h1 className='elms-sans text-base sm:text-lg lg:text-xl text-center px-2'>Create Your Temporary Source File</h1>
          <img className='cursor-pointer my-2' onClick={createfile} width={40} height={40} src={createrImg} alt="Create file" />
          <h1 className='roboto text-xs sm:text-sm lg:text-base text-center px-2 truncate w-full'>Source: {sourcefile}</h1>
        </div>

        {/* Destination file card */}
        <div className="bg-[#edd687] flex flex-col justify-center border-2 border-dotted items-center w-full sm:w-[45%] lg:w-[30%] h-40 sm:h-48 rounded-lg font-light shadow-md hover:shadow-lg transition-shadow">
          <h1 className='elms-sans text-base sm:text-lg lg:text-xl text-center px-2'>Select Your Destination File</h1>
          <img className='cursor-pointer my-2' onClick={selectDestination} width={40} height={40} src={fileImg} alt="Select file" />
          <h1 className='roboto text-xs sm:text-sm lg:text-base text-center px-2 truncate w-full'>Destination: {destinationfile}</h1>
        </div>
      </div>

      {/* Button group - responsive stacking */}
      <div className='flex flex-col sm:flex-row gap-3 sm:gap-2 justify-center items-center mb-8 flex-wrap'>
        <button onClick={startSync} type="button" className="w-full sm:w-auto text-white text-xs sm:text-sm bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 font-medium rounded-lg px-6 sm:px-8 py-2.5">Start Sync</button>
        <button onClick={stopsync} type="button" className="w-full sm:w-auto text-white text-xs sm:text-sm bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 font-medium rounded-lg px-6 sm:px-8 py-2.5">Stop Sync</button>
        <button onClick={OpenVsCode} type="button" className="w-full sm:w-auto text-white text-xs sm:text-sm bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 font-medium rounded-lg px-6 sm:px-8 py-2.5">Open in VS Code</button>
      </div>

      {/* Create file modal - responsive positioning and sizing */}
      <div className={`${disable?"hidden":"block"} fixed sm:absolute inset-4 sm:inset-auto sm:top-[15%] sm:right-[5%] md:right-[20%] lg:right-[30%] w-auto sm:w-[90%] md:w-[60%] lg:w-[40%] max-w-sm bg-[#F5F5F5] border-2 border-gray-300 rounded-lg shadow-xl p-6 sm:p-8 z-50`}>
        <img width={20} height={20} onClick={handleclick} className='absolute right-3 top-3 cursor-pointer hover:scale-110 transition-transform' src={crossImg} alt="close" />
        <h3 className='text-center font-medium text-base sm:text-lg mt-6 mb-4'>Create a Temporary File</h3>
        
        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center mb-4'>
          <label className='cursor-pointer text-sm sm:text-base whitespace-nowrap' htmlFor="Create">Enter File Path:</label>
          <input ref={file} type="text" id='Create' className='border border-gray-300 text-xs sm:text-sm font-medium h-8 sm:h-10 px-2 rounded w-full' defaultValue={process.cwd()}/>
        </div>
        
        <button onClick={getTemporaryFile} className='w-full sm:w-40 text-white text-sm sm:text-base font-medium rounded-lg h-9 sm:h-10 cursor-pointer bg-black hover:bg-gray-800 transition-colors'>Create File</button>
      </div>

      {/* Logs section - responsive layout */}
      <div className="mt-8 sm:mt-12 mx-auto w-full sm:max-w-3xl lg:max-w-4xl px-2 sm:px-0 mb-3.5">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 px-2 sm:px-0">Sync Logs:</h2>
        <div className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50 min-h-[150px] sm:min-h-[200px] max-h-[300px] sm:max-h-[400px] overflow-y-auto shadow-sm">
          {logs.length === 0 ? (
            <p className="text-gray-400 text-center text-sm">No logs yet</p>
          ) : (
            logs.map((message, i) => (
              i%4===0 && (
                <p key={i} className={`py-2 sm:py-2.5 px-2 sm:px-3 border-b text-xs sm:text-sm last:border-0 ${i % 2 === 0 ? 'bg-gray-100' : ''}`}>
                  {message}
                </p>
              )
            ))
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default Dragdrop
