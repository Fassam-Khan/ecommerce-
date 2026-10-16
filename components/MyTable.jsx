import React from 'react'

const MyTable = () => {
    return (
        <div>
            <table className='w-full mt-6'>
                <thead className='bg-[#F7F7F7]  rounded-2xl'>
                    <tr className=''>
                        <td className='text-sm font-semibold px-2 py-1 w-[5%] '><input type="checkbox" /></td>
                        <td className='text-sm font-semibold px-2 py-1 w-[40%] '>Title</td>
                        <td className='text-sm font-semibold px-2 py-1 w-[40%] '>Products</td>
                        <td className='text-sm font-semibold px-2 py-1 w-[30%] '>Sales Channel</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='text-sm font-semibold px-2 py-1 '><input type="checkbox" /></td>
                        <td className='text-sm font-semibold px-2 py-1 '>Title</td>
                        <td className='text-sm font-semibold px-2 py-1 '>Products</td>
                        <td className='text-sm font-semibold px-2 py-1 '>Sales Channel</td>
                    </tr>
                </tbody>
            </table>

        </div>
    )
}

export default MyTable
