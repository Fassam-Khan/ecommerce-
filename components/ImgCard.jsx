import Image from 'next/image'
import React from 'react'
import Checkbox from './Checkbox'
import { useState } from 'react'

const ImgCard = ({data, handler, check}) => {
    const [selectedIds, setSelectedIds] = useState([]);

  





    return (
        <div className='relative w-[120px] hover:bg-gray-300  h-[120px] border flex flex-col justify-center items-center mt-6  '>
            <div className='relative flex justify-center items-center mt-4 px-2 py-1 border  w-[100] h-[100px] '>
                <img src={data.file} width={100} height={100} alt='lo' />
                <div className='absolute  left-0 w-3 h-3 top-0 '>
                    <input type="checkbox" 
                    value={data?._id}
                    checked={check.includes(data?._id)}
                    name="" id="" onChange={(e)=> handler(e)} />
                </div>
            </div>




        </div>
    )
}

export default ImgCard
