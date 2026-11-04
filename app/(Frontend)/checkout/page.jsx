"use client"

import CheckBox1 from '@/components/CheckBox1'
import InputFields from '@/components/checkout/InputFields'
import Radio from '@/components/checkout/Radio'


import Link from 'next/link'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectCartItems } from '@/app/redux/cartSlice'

const page = () => {

const itemsData = useSelector(selectCartItems)
console.log(itemsData)


  return (
    <div className="flex justify-between ">

      {/* left div  */}
      <div className="px-4 py-2  w-[48%] ">

        {/* Contact div  */}
        <div className='flex flex-col gap-1'>
          {/* heading  */}
          <div className="flex justify-between items-center">
            <p className="text-xl font-semibold ">Contact</p>
            <Link href={'/'}>
              <p className='text-blue-400 cursor-pointer underline text-sm'>Sign in</p>
            </Link>
          </div>

          {/* Input Fields  */}
          <div>
            <InputFields placeholder={"email"} name={"email"} type={"email"} />
            <div className='flex gap-1 items-center text-sm'>
              <CheckBox1 id="news" />
              <label htmlFor="news">Email me with news and offers</label>

            </div>


          </div>
        </div>

        {/* Delivery  */}
        <div className='flex flex-col gap-1 mt-4'>
          {/* heading  */}
          <div className="flex justify-between items-center">
            <p className='text-xl font-semibold'>Delivery</p>
          </div>

          {/* Input Fields  */}
          <div>
            {/* Select Fields  */}
            <select name="" id="" className="w-full border  px-2 py-3  ">
              <option value="">Pakistan</option>
            </select>

            {/* Names  */}
            <div className="flex items-center   gap-1 w-full mt-3">
              <div className='w-[50%]'>
                <InputFields placeholder={"First name"} type={"text"} name={"firstName"} />

              </div>
              <div className='w-[50%]'>
                <InputFields placeholder={"Last name"} type={"text"} name={"lastName"} />
              </div>

            </div>

            {/* Address  */}
            <div className='mt-3'>
              <InputFields placeholder={"Address"} type={"text"} name={"address"} />
            </div>

            {/* Address  */}
            <div className='mt-3'>
              <InputFields placeholder={"Address"} type={"text"} name={"Apartment, suite, stc. (optional)"} />
            </div>

            {/* City  */}
            <div className="flex items-center   gap-1 w-full mt-3">
              <div className='w-[50%]'>
                <InputFields placeholder={"City"} type={"text"} name={"city"} />

              </div>
              <div className='w-[50%]'>
                <InputFields placeholder={"Postal Code"} type={"text"} name={"postalcode"} />
              </div>

            </div>


            {/* Phone  */}
            <div className='mt-3'>
              <InputFields placeholder={"Phone"} type={"number"} name={"phone"} />
            </div>

            {/* Save option  */}
            <div className='mt-1 text-sm flex items-center gap-1'>
              <CheckBox1 />
              <label htmlFor="">Save this information for next time</label>
            </div>

            {/* Shipping Method  */}

            <div className='flex justify-between border border-gray-300 px-4 py-1 rounded-lg mt-6'>
              <p>Standard</p>
              <p>Rs 350</p>
            </div>


            {/* Payment  */}
            <div className="mt-6">
              <Radio />

            </div>




          </div>
        </div>

        {/* Complete  */}
        <div className="mt-6">
          <button className="w-full bg-blue-400 py-1 px-4">Complete Order</button>
        </div>

      </div>

      {/* RIgth DIv  */}
      <div className="w-[48%] bg-[#F5F5F5] ">

        <div>
          
        </div>

      </div>


    </div>
  )
}

export default page
