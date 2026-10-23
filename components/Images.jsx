"use client"
import { useState, useEffect } from 'react';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import ImgCard from './ImgCard';
import UpoadBtn from './UploadBtn';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "600px",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
};

export default function BasicModal({ title, onSendToParent , isVarient}) {
  const [open, setOpen] = React.useState(false);
  const [Loading, setLoading] = useState(false)
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [File, setfile] = useState(null)





  const changeHandler = (e) => {
    setfile(e.target.files[0])
  }



  const [Select, setSelect] = useState([])
  const [paintsImages, setpaintsImages] = useState([])

  const handleCheckBox = (e) => {
    const { value, checked } = e.target;
    const numericId = value // Fixed type mismatch

    if (checked) {
      setSelect([...Select, numericId]);

    } else {
      setSelect(Select.filter((id) => id !== numericId));
    }
  };


  const selectedImg = paintsImages.find((item) => item.id == Select[0])
  const multipleImages = paintsImages.filter((item) => Select.includes(item._id))

  

  



  const handleClick = () => {
    onSendToParent(Select, paintsImages, multipleImages , isVarient,selectedImg);
  };


  const getMedia = async () => {
    setLoading(true)
    try {

      const formData = new FormData();
      formData.append("file", File);
      const res = await axios.post("/api/upload", formData)
      const mediaUrl = res.data?.url


      if (mediaUrl) {
        const res2 = await axios.post("/api/media", { file: mediaUrl })

        if (res2) {
          toast.success("Uploaded Successfully")
          fetchImage()
        }

      }


    } catch (error) {
      console.log(error.message);
      console.error(error.response?.data?.message || error.message);
      toast.error("Upload failed");

    } finally {
      setLoading(false)
    }

  }




  const fetchImage = async () => {
    const res = await axios.get("/api/images?limit=20")
    if (res) {
      setpaintsImages(res.data.data)
    }
  }




  useEffect(() => {
    fetchImage()
    if (File) {
      getMedia()
    }


  }, [File])


  return (
    <div>
      <Button onClick={handleOpen}>{title}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* Heading  */}
          <Box className="flex justify-between px-3 py-2">
            <div>
              <h2>Select Images</h2>
            </div>
            <div className='cursor-pointer '>
              <button className='cursor-pointer' onClick={handleClose}>Close</button>
            </div>
          </Box>

          {/* Upload File  */}
          <Box className="border border-dashed rounded h-[100px] ml-3 mr-3 mt-3 flex justify-center items-center">
            {Loading ? <p>Loading...</p> : <UpoadBtn handler={changeHandler} />
            }

          </Box>

          {/* Images Parent  */}
          <Box className="grid grid-cols-4 px-3 py-3 h-[280px] overflow-y-auto gap-2 w-full border border-red-200">
            {paintsImages.map((e) => {
              return <ImgCard key={e._id} data={e} handler={handleCheckBox} check={Select} />
            })}


          </Box>

          {/* Footer  */}
          <Box className="flex justify-end  gap-2 mt-4 px-3 pb-3">
            <button className="px-1 border  cursor-pointer text-sm rounded-full" onClick={() => setSelect([])}>Cancel</button>
            {Select.length > 0 ? <button className="px-1 border bg-black text-white  cursor-pointer text-sm rounded-full " onClick={() => { handleClick(), handleClose() }}>Done</button> :
              <button className="px-1 border  cursor-pointer text-sm rounded-full " >Done</button>

            }

          </Box>

        </Box>
      </Modal>

      <ToastContainer />
    </div>
  );
}
