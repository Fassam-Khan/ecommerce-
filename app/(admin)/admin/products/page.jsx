import RoundButton from '@/components/RoundButton'
import SearchInput from '@/components/SearchInput'
import TableMy from '@/components/UI/TableMy'
import Link from 'next/link'
import React from 'react'

const page = () => {
    return (
        <div className=''>
            {/* Top Head  */}
            <div className='flex justify-between '>
                <div>
                    <p>Products</p>
                </div>
                <div>
                    <Link href={'/admin/products/new'}>
                        <RoundButton title={"Add Products"} />
                    </Link>
                </div>
            </div>

            {/* Input  */}
            <div className="mt-6 w-[90%]">
                <SearchInput />

            </div>

            {/* Table  */}
            <div className='mt-6'>
                <TableMy/>
            </div>

        </div>
    )
}

export default page
