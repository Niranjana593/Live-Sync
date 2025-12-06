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
      <div className='fileupload justify-center flex w-100vw  gap-10'>
        <div className="bg-[#edd687] flex flex-col justify-center border-2 border-dotted items-center source w-[30%]  h-50  rounded-lg font-light">
          <h1 className='elms-sans text-lg'>Create Your Temporary Source File</h1>
          <img className='cursor-pointer' onClick={createfile} width={50} height={50} src={createrImg} alt="" />
          <h1  className='roboto'>Source File:{sourcefile}</h1>
        </div>
        <div className="bg-[#edd687] flex flex-col justify-center border-2 border-dotted items-center source w-[30%]  h-50  rounded-lg font-light">
          <h1 className='elms-sans text-lg'>Select Your Destination File</h1>
          <img className='cursor-pointer' onClick={selectDestination} width={50} height={50} src={fileImg} alt="" />
          <h1 className='roboto'>Destination File:{destinationfile}</h1>
        </div>
        
      </div>
      <div className='flex flex-col justify-center m-auto mt-10  items-center text-center '>
        <button onClick={startSync} type="button" className="text-white bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center me-2 mb-2">Start Sync</button>
        <button onClick={stopsync} type="button" className="text-white bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center me-2 mb-2">Stop Sync</button>
        <button onClick={OpenVsCode} type="button" className="text-white bg-gradient-to-br from-green-400 to-blue-600 cursor-pointer hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center me-2 mb-2">Open Source File in VS Code</button>
      </div>
      <div className={`${disable?"hidden":"block"} w-[40%]  flex flex-col gap-2 m-auto border-2 absolute  top-[15%] right-[30%] bg-[#F5F5F5] shadow-[3px_4px_17px_1px_rgba(0,0,0,0.3)] pt-13px m-33px text-[21px]`}>
         <img width={20} height={100} onClick={handleclick} className='border-none absolute right-3 top-2 cursor-pointer' src={crossImg} alt="cross mark" />
         <h3 className='flex justify-center font-medium mt-[44px] Inter'>Create a Temporary File</h3>
         <div className='flex gap-[10px] pl-[74px] pt-[14px] '>
            <label className='Inter cursor-pointer' htmlFor="Create">Enter A File:</label>
            <input ref={file} type="text" id='Create' className='border-1 text-sm font-medium h-6 Inter' defaultValue={process.cwd()}/>
         </div>
         <button onClick={getTemporaryFile} className='mb-[20px] text-white roboto border-2 border-black w-40 m-auto text-lg rounded-lg h-8 cursor-pointer bg-black text-center'>Create a File</button>
      </div>
      <div className="mt-8 mx-auto max-w-2xl mb-3.5">
        <h2 className="text-2xl font-semibold mb-4">Logs Messages:</h2>
        <div className="border rounded-lg p-4  bg-gray-50 h-[200px]  overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center">No logs yet</p>
          ) : (
            JSON.parse(localStorage.getItem('Sync-message')).map((message, i) => (
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
