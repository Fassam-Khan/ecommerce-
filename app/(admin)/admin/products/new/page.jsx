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
import Toggle from '@/components/Toggle'

const page = () => {

    const [ImagesData, setImagesData] = useState([])
    const [SelectImages, setSelectImages] = useState([])
    const [finalImage, setfinalImage] = useState([])
    const [isImgChange, setisImgChange] = useState(false)
    const [CHangeImg, setCHangeImg] = useState(0)
    const [isInventory, setisInventory] = useState(false)
    const [isVarient, setisVarient] = useState(false)


  
const [variants, setVariants] = useState([""]);

const handleVariantChange = (index, e) => {
  const value = e.target.value;

  const updatedVariants = [...variants];
  updatedVariants[index] = value;

  // Remove empty inputs after the current input
  if (value.trim() === "") {
    updatedVariants.splice(index + 1);
  } 
  // Create the next input when the current one has a value
  else if (index === updatedVariants.length - 1) {
    updatedVariants.push("");
  }

  setVariants(updatedVariants);
};





    const handleChildData = (childData, paintsImages, multipleImages) => {
        setImagesData(paintsImages)
        setSelectImages(multipleImages)
    };

    const handleCheckbox = (event) => {
        setisInventory(event.target.checked)

    }

    const changeImage = (id) => {
        console.log(id);
        setisImgChange(true)
        setCHangeImg(id)
    }

    const deleteImg = () => {
        console.log(SelectImages);
        console.log(CHangeImg);
        const remove = SelectImages.filter((item) => item._id != CHangeImg)
        setSelectImages(remove)

    }
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
                            {isImgChange && (
                                <button onClick={deleteImg} >Remove</button>
                            )}
                            <div className="flex gap-2 flex-wrap">


                                {SelectImages.length > 0 ? <>  {SelectImages.map((e) => {
                                    return <div className="border relative border-gray-300 group hover:bg-gray-200">
                                        <Image src={e.file} width={150} height={150} alt='l' />
                                        <div className="absolute top-2 left-2 hidden group-hover:flex  ">
                                            <input type="checkbox" onClick={() => changeImage(e._id)} />
                                        </div >

                                    </div>



                                })}
                                    <Images title={"Upload Images"} onSendToParent={handleChildData} />
                                </>


                                    : <Images title={"Upload Images"} onSendToParent={handleChildData} />}

                            </div>


                        </Box>



                    </Paper>

                    {/* Price */}
                    <Paper className='w-full rounded-lg bg-white px-2 mt-6 py-2 '>

                        <Box className="mt-4">
                            <p className='text-sm font-semibold mb-3'>Price</p>

                            {isVarient ? <div className="bg-[#F5F8FE] px-4 py-1">
                                {/* top div  */}
                                <div className="flex justify-between">
                                    <p>Varient 1</p>
                                    <div>
                                        <button onClick={() => setisVarient(false)}>Close</button>
                                    </div>
                                </div>

                                {/* Varient Naem  */}
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-[12px]">Varient Name</h4>
                                    <Input1 type={"text"} />
                                </div>

{/* total  */}
                                <div className="flex flex-col gap-2 mt-4">
                                    <h4 className="text-[12px]">Total Variants</h4>

                                    <div className="border border-dashed bg-white flex flex-col gap-2 justify-center">
                                        {variants.map((variant, index) => (
                                            <div className="px-3 py-2" key={index}>
                                                <Input1
                                                    type="text"
                                                    name={`variant-${index}`}
                                                    placeholder={`Variant ${index + 1}`}
                                                    value={variant}
                                                    handler={(e) => handleVariantChange(index, e)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>



                            </div> : <div className="mb-3">
                                <button onClick={() => setisVarient(true)} className="border cursor-pointer rounded text-sm px-2 py-0.5">Add Variation</button>
                            </div>}


                            <div className="flex gap-2 ">
                                <Input1 type={"number"} name={"price"} placeholder={"Price"} />
                                <Input1 type={"number"} name={"costPrice"} placeholder={"Cost Price"} />
                            </div>

                            <div className="flex gap-4 mt-4" >
                                <div className="flex gap-2 items-center mt-2">
                                    <p className="text-sm font-semibold">Profit</p>
                                    <div className="w-[40px] h-5 bg-gray-300 text-[10px] flex justify-center items-center rounded-2xl ">-</div>
                                </div>
                                <div className="flex gap-2 items-center mt-2">
                                    <p className="text-sm font-semibold">Margin</p>
                                    <div className="w-[40px] h-5 bg-gray-300 text-[10px] flex justify-center items-center rounded-2xl ">-</div>
                                </div>

                            </div>

                        </Box>
                    </Paper>


                    {/* Inventory */}
                    <Paper className='mt-6 px-3 py-2'>
                        <Box className=" ">
                            {/* top head  */}
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold ">Inventory</p>
                                <div className="flex gap-2 items-center">
                                    <p className="text-[10px]">Inventory Track</p>
                                    <Toggle handler={handleCheckbox} check={isInventory} />

                                </div>
                            </div>

                            {/* Inventory  */}

                            <div className="border border-gray-300">
                                <div className="flex justify-between px-2 py-1 items-center bg-gray-300 mt-2 text-sm rounded-2xl">
                                    <p>Quantity</p>
                                    <p>Quantity</p>
                                </div>
                                <div className="mt-3 px-2">
                                    <Input1 type={"number"} />
                                </div>

                            </div>

                        </Box>
                    </Paper>


                    {/* Varient 
                    <Paper className='w-full rounded-lg bg-white px-2 mt-6 py-2 relative '>
                        <Box className="mt-4">
                            <p className='text-sm font-semibold mb-3'>Varient</p>
                            <div className="relative">
                                <button
                                onClick={()=> setisVarient(true)}
                                className=" hover:bg-gray-300 text-[10px] cursor-pointer  rounded-2xl px-2 py-0.5">Add option like size and color</button>

                                
                            </div>


                        </Box>
                        {isVarient && (
                            <div className="mt-6 border absolute top-15 bg-white w-[200px] h-[100px] shadow-2xl">
                            <button className="hidden hover:bg-gray-300 text-[10px] cursor-pointer  rounded-2xl px-2 py-0.5">Create Custom Value</button>
                            </div>

                        )}

                        
                    </Paper> */}

                </div>
                {/* Right Div  */}
                <div>

                </div>

            </div>

        </div>
    )
}

export default page
