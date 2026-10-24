import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const TableMy = () => {
    return (
        <div>
            <table className='rounded-2xl w-full '>
                <thead className='bg-[#D1D5DC] '>
                    <tr className='rounded-md'>
                        <td className='w-[2%] px-3 py-0.5 '><input type="checkbox" /></td>
                        <td className='w-[6%] px-3 py-0.5 '>Images</td>
                        <td className='w-[20%] px-3 py-0.5 '>Products</td>
                        <td className='w-[2%] px-3 py-0.5 '>Status</td>
                        <td className='w-[14%] px-3 py-0.5 '>Inventory</td>
                        <td className='w-[15%] px-3 py-0.5 '>Brand</td>
                        <td className='w-[5%] px-3 py-0.5 '></td>

                    </tr>
                </thead>

                <tbody>
               


                    <tr>
                        <td className='w-[30px] px-3 py-0.5 '><input type="checkbox" /></td>
                        <td className='w-[7%] px-3 py-0.5 '>
                            <div className='border flex just-fy-center items-center w-[40px] h-[40px]'>
                                <Image src={'/imageholder.png'} width={40} height={40} />
                            </div>
                        </td>
                        <td className=' px-3 py-0.5 '>
                            <Link href={'/admin/products'}>
                                <p className='text-sm font-semibold'>Acryjsh hshv</p>
                            </Link>
                        </td>
                        <td className=' px-3 py-0.5   '>
                            <div className='bg-green-500 px-2 py-0.5 flex justify-center items-center'>
                                <p className='text-[10px] font-semibold'>Active</p>
                            </div>

                        </td>
                        <td className=' px-3 py-0.5 '>
                                <p className='text-sm font-semibold'>Acryjsh hshv</p>
                        </td>
                        <td className=' px-3 py-0.5 '>
                                <p className='text-sm font-semibold'>Keep SMiling</p>
                        </td>
                        <td className=' px-3 py-0.5 '>
                            <Link href={'/admin/products'}>
                                <p className='text-sm font-semibold'>View</p>
                                </Link>
                        </td>


                    </tr>
                </tbody>
            </table>

        </div>
    )
}

export default TableMy
