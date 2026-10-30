import React from 'react'
import { Heart } from 'lucide-react'

const WishList = () => {
  return (
    <div className='relative  '>
        <Heart/>

        <div className='absolute -right-2 -top-1 rounded-full text-[12px] font-bold w-4 h-4 flex items-center justify-center text-white p-0.5 bg-[var(--brand-red)] '>
          0
        </div>
      
    </div>
  )
}

export default WishList

