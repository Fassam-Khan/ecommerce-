import CollectionTable from '@/components/CollectionTable'
import DarkBtn from '@/components/DarkBtn'
import TablePag from '@/components/TablePag'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className=''>
      {/* top Head  */}
      <div className='flex justify-between'>
        <div>
          <p className='text-sm font-bold'>Collections</p>
        </div>
        <div>
          <Link href={'/admin/collections/new'}><DarkBtn message={"Add Collection"} /></Link>
        </div>
      </div>

      {/* Table  */}
      <CollectionTable/>




     


    </div>
  )
}

export default page
