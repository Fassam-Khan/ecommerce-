"use client"
import Breadcrumb from '@/components/Breadcum'
import Input1 from '@/components/Input1'
import { Paper, Box } from '@mui/material'
import React from 'react'
import UploadBtn from '@/components/UploadBtn'
import { useState, useEffect } from 'react'
import Button1 from '@/components/Button1'
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'
import Images from '@/components/Images'

const page = () => {

    const paintsImages = [
        { id: 1, title: "Professional Acrylic Paint Set", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675", category: "Paints" },
        { id: 2, title: "Watercolor Tube Kit", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f", category: "Paints" },
        { id: 3, title: "Oil Paint Pastels", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab", category: "Paints" }
    ];

    const [Category, setCategory] = useState({
        title: "",
        description: "",
        slug: "",
        file: null

    })

    const [ImgUrlBC, setImgUrlBC] = useState([])






    const [ImgUrl, setImgUrl] = useState([])
    const [currentImg, setcurrentImg] = useState([])







    const changeHandler = (e) => {
        const { name, value, files } = e.target

        if (name == "file") {
            setCategory((prev) => ({ ...prev, file: files[0] }))
        }
        else {
            setCategory((prev) => ({ ...prev, [name]: value }))
        }


    }

   


    useEffect(() => {

        if (ImgUrl) {
            const selectedImg = ImgUrlBC.find((item) => item._id == ImgUrl[0])
            setcurrentImg(selectedImg)
        }

    }, [ImgUrl])

 


    const handleChildData = (childData, paintsImages) => {
        setImgUrl(childData)
        setImgUrlBC(paintsImages)
    };

  


    const submitHandler = async () => {

        Category.slug = `collections/${Category.title.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")}`
        try {
            if (!Category.title.trim()) {
                return toast.warning("Please fill title")
            }
            Category.file = currentImg?.file

            const res = await axios.post("/api/categories", Category)
            if(res.data.success){
                setCategory({
                    title: "",
                    description: "",
                    slug: "",
                    file: null,
                  });
                  
                  // Reset selected image
                  setImgUrl([]);
                  setcurrentImg([]);

                  return  toast.success("Uploaded Successfully")


            }
            else{
                toast.error("Something went wrong ")
            }


         



        }
        catch (error) {
            console.log(error);

        }

    }
    return (
        <div>
            {/* Breadcum  */}
            <Breadcrumb title={"Collections"} titleSlug={"/admin/collections"} activeSlug={"/admin/collections/new"} active={"Add Collections"} />


            <div className='w-[600px] m-auto mt-16 ' >
                <Paper className='flex gap-5 px-4 py-2'>

                    <Box className="w-full flex flex-col gap-4">
                        <Box>
                            <Input1 name="title" value={Category.title} type={"text"} handler={changeHandler} placeholder={"Enter title"} width={"100%"} />
                        </Box>
                        <Box className="flex flex-col gap-1">
                            <label htmlFor="">Enter Description</label>
                            <textarea name="description" value={Category.description} onChange={(e) => changeHandler(e)} id="" cols="25" rows="5" className='px-2 outline outline-gray-300 py-1'></textarea>
                        </Box>

                        <Box className="">
                            {currentImg ? <img src={currentImg.file} width={100} height={100} /> : <Box className="w-[100px] h-[100px] border border-dashed flex justify-center items-center">
                                <Images title={"Upload Image"} onSendToParent={handleChildData} />
                            </Box>}



                            <Box className="!mt-4 flex justify-end">
                                <Button1 message={"Save"} handler={submitHandler} />

                            </Box>
                        </Box>
                    </Box>

                </Paper>
            </div>
            <ToastContainer />
        </div>
    )
}

export default page



{/* <UploadBtn handler={changeHandler} name={"file"} img={ImgUrl} />   */ }
