import RoundButton from '@/components/RoundButton'
import SearchInput from '@/components/SearchInput'
import TableMy from '@/components/UI/TableMy'
import Link from 'next/link'
import React, { Suspense } from 'react'

const page = () => {
    return (
        <div>
            {/* Top Head */}
            <div className='flex justify-between'>
                <p>Products</p>
                <Link href={'/admin/products/new'}>
                    <RoundButton title={"Add Products"} />
                </Link>
            </div>

            {/* Input */}
            <div className="mt-6 w-[90%]">
                <Suspense>
                    <SearchInput />
                </Suspense>
            </div>

            {/* Table */}
            <div className='mt-6'>
                <Suspense>
                <TableMy />

                </Suspense>
            </div>
        </div>
    )
}

export default page