import React from 'react'
import { ShoppingCart } from 'lucide-react'

const AddCart = (image, title, price) => {
  return (
    <div >
       
        <button className='border flex justify-center items-center gap-2 w-full bg-[var(--brand-red)] text-white  w-full font-semibold  rounded-2xl py-2 cursor-pointer'>
        <ShoppingCart className='text-white'/>
            Add to cart</button>
      
    </div>
  )
}

export default AddCart
