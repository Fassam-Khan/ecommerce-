import Image from 'next/image'
import React from 'react'
import AddCart from './AddCart'

const ProductCard = () => {
    return (
        <div className='rounded-2xl border border-gray-300  w-[280px] h-[370px]'>

            {/* Image div  */}
            <div className='w-full flex justify-center items-center  '>
                <Image src={'/test.webp'} width={250} height={200} className='object-cover rounded-2xl object-center' />
            </div>

            {/* Info div  */}

            <div className='px-3 mt-3'>
                <p className='text-sm font-bold'>Acrylic Paint 12 Color Set </p>
                <p className='mt-2'>Rs 300</p>


                {/* Add to cart  */}

                <AddCart/>

            </div>


        </div>
    )
}

export default ProductCard
