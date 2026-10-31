import Hero from '@/components/Hero'
import CategoryCollect from '@/components/UI/CategoryCollect'
import React from 'react'
import NewArrival from '@/components/UI/NewArrival'

const page = () => {
  return (
    <div>
      <Hero />

      {/* Collections Sections  */}
      <div className='py-2 px-4 mt-6  '>
        <CategoryCollect className="" />
      </div>
      {/* New Arrival  */}
      <div className='py-2 px-4 mt-6  '>

        <NewArrival />

      </div>
    </div>
  )
}

export default page
