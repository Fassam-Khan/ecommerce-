"use client"
import Input1 from '@/components/Input1'
import { Box, Paper, Typography } from '@mui/material'
import { ChevronLeft, Tags } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { React, useEffect } from 'react'
import RichTextEditor from '@/components/RichTextEditor'
import Images from "@/components/Images"
import Image from 'next/image'

const page = () => {

    const [ImagesData, setImagesData] = useState([])
    const [SelectImages, setSelectImages] = useState([])
    const [finalImage, setfinalImage] = useState([])




    const handleChildData = (childData, paintsImages, multipleImages) => {
        setImagesData(paintsImages)
        setSelectImages(multipleImages)
    };
    return (
        <div>
            {/* top Head  */}
            <div className='flex gap-3'>
                <Link href={'/admin/products'}>
                    <div className='relative  group w-5 hover:bg-gray-300 transition-all h-5 flex justify-center items-center p-0.5 cursor-pointer rounded-full border border-gray-300'>
                        <ChevronLeft />
                        <div className='group-hover:flex absolute hidden top-5  bg-black text-white font-semibold text-[10px] px-2 py-1 rounded-2xl'>
                            Products
                        </div>
                    </div>
                </Link>
                <div className='text-[10px] font-semibold flex gap-2 '>
                    <Tags className='w-4 h-4' />
                    Products
                </div>
            </div>

            {/* Middle content  */}
            <div className='max-w-[750px] mt-10 m-auto  flex  '>
                {/* left Div  */}
                <div className='w-[65%]'>
                    <h2 className='text-xl font-semibold '>Add Product</h2>

                    {/* form s */}
                    <Paper className='w-full rounded-lg bg-white px-2 mt-4 py-3'>
                        {/* title */}
                        <Box className="">
                            <p className='text-sm font-semibold mb-3'>Title</p>
                            <Input1 type={"text"} name={"title"} width={"100%"} placeholder={"Add Title"} />
                        </Box>

                        {/* Description  */}
                        <Box className="mt-4">
                            <p className='text-sm font-semibold mb-3'>Description</p>
                            <RichTextEditor />
                        </Box>

                        {/* Media  */}
                        <Box className="mt-4">
                            <p className='text-sm font-semibold mb-3'>Media</p>
                            <div className="flex gap-2 flex-wrap">

                                {SelectImages.length > 0 ? <>  {SelectImages.map((e) => {
                                    return <div  className="border border-gray-300">
                                            <Image src={e.file} width={150} height={150} alt='l' /></div>

                                   
                                         
                                    }) }
                                     <Images title={"Upload Images"} onSendToParent={handleChildData} />
                                </> 
                                
                                
                                    : <Images title={"Upload Images"} onSendToParent={handleChildData} />}

                            </div>


                        </Box>

                    </Paper>

                </div>
                {/* Right Div  */}
                <div>

                </div>

            </div>

        </div>
    )
}

export default page
