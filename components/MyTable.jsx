"use client"
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useState , useEffect} from 'react'
import DeleteModal from './DeleteModal'
import axios from 'axios'

const MyTable = () => {
    const [isTrue, setisTrue] = useState(false)

    const [Data, setData] = useState([])
    const [checkTrue, setcheckTrue] = useState(false)
    const [DeleteId, setDeleteId] = useState(null)
    const [page, setpage] = useState(1)
    const [limit, setlimit] = useState(50)

    const collections = [
        {
            title: "Handmade",
            products: "",
            url: "/admin/categories/",
            id: 1

        },
        {
            title: "Art",
            products: "",
            url: "/admin/categories/",
            id: 2

        },
        {
            title: "kushbhi",
            products: "",
            url: "/admin/categories/",
            id: 3

        },
    ]

    const toggle = (id) => {
        setisTrue((prev) => !prev)
        setDeleteId(id)

    }

    const getCollections = async ()=>{
        const res = await axios.get(`/api/categories?page=${page}&limit=${limit}`)
        setData(res.data.data)
    }




    useEffect(() => {
       
        getCollections()
    
    }, [])






    return (
        <div>
            <table className='w-full mt-6 border-separate  border-spacing-y-2'>
                <thead className='w-full    '>
                    {isTrue ? <tr className='bg-[#F7F7F7]  rounded-2xl'>
                        <td className='text-sm font-semibold px-2 py-1 w-[5%] '>
                            <input type="checkbox" onClick={toggle} />
                        </td>
                        <td className='text-sm font-semibold px-2 py-1 w-[5%] '><DeleteModal id={DeleteId}/> </td>

                        <td className='text-sm font-semibold px-2 py-1 w-[40%] '>
                        </td>

                        <td className='text-sm font-semibold px-2 py-1 w-[30%] '></td>
                        <td className='text-sm font-semibold px-2 py-1 w-[40%] '> </td>
                    </tr>


                        : <tr  className='bg-[#F7F7F7]  rounded-2xl'>
                            <td className='text-sm font-semibold px-2 py-1 w-[5%] '><input type="checkbox" onClick={toggle}  /></td>
                            <td className='text-sm font-semibold px-2 py-1 w-[5%] '></td>

                            <td className='text-sm font-semibold px-2 py-1 w-[40%] '>Title</td>

                            <td className='text-sm font-semibold px-2 py-1 w-[30%] '>Products</td>
                            <td className='text-sm font-semibold px-2 py-1 w-[40%] '>Sales Channel</td>
                        </tr>
                    }

                    {Data.map((e, id)=> {
                        return    <tr className='border-b border-gray-300 hover:bg-[#F7F7F7]   cursor-pointer   '>
                        <td className=' text-sm font-semibold px-2  '><input type="checkbox" onClick={()=> toggle(e._id)} /></td>
                        <td className=''>
                            <div className='border border-gray-300 w-[30px] h-[30px] rounded-lg'>
                                <Image src={e.file || '/imageholder.png'} width={60} height={60} alt='image' />

                            </div>
                        </td>
                        <td className=' text-sm font-semibold px-2  '><Link href={`/admin/collections/${e._id}`} className='hover:underline'>{e.title} </Link> </td>
                        <td className=' text-sm font-semibold px-2  '>-</td>
                        <td className=' text-sm font-semibold px-2  '>-</td>
                    </tr>
                    })}

                    




                </thead>
                <tbody className=''>




               


                </tbody>
            </table>

        </div>
    )
}

export default MyTable
