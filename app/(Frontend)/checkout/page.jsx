"use client"

import CheckBox1 from '@/components/CheckBox1'
import InputFields from '@/components/checkout/InputFields'
import Radio from '@/components/checkout/Radio'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectCartCount, selectCartItems, selectCartTotal } from '@/app/redux/cartSlice'
import Image from 'next/image'
import { ToastContainer, toast } from 'react-toastify'


const page = () => {

  const itemsData = useSelector(selectCartItems)
  const cartCount = useSelector(selectCartCount)
  const cartTotal = useSelector(selectCartTotal)

  const [OrderData, setOrderData] = useState({
    email: "",
    country: "pakistan",
    firstName: "",
    lastName: "",
    address: "",
    optionalAdress: "",
    city: "",
    postalCode: "",
    phone: 1,
    shippingCharges: 350,
    payment: "",
    products: [],
    totalItems: 1,
    totalAmmount: 1


  })


  useEffect(() => {
    OrderData.products = itemsData
    OrderData.totalItems = cartCount
    OrderData.totalAmmount = cartTotal




  }, [itemsData, cartCount, cartTotal])



  const changeHandler = (e) => {
    const { name, value } = e.target

    setOrderData((prev) => ({ ...prev, [name]: value }))
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Order Placing FUnction 

  const submitHandler = () => {
    console.log("may chla")
    if (!OrderData.email.trim()) {
      return toast.warning("Please enter  email")
    }
    if (!emailRegex.test(OrderData.email)) {
      return toast.warning("please enter valid email")
    }
    if (!OrderData.country.trim()) {
      return toast.warning("Please select  country")
    }
    if (!OrderData.firstName.trim()) {
      return toast.warning("Please enter  First Name")
    }
    if (!OrderData.lastName.trim()) {
      return toast.warning("Please enter  Last Name")
    }
    if (!OrderData.address.trim()) {
      return toast.warning("Please enter  address")
    }
    if (!OrderData.city.trim()) {
      return toast.warning("Please enter  city")
    }
    if (!OrderData.payment.trim()) {
      return toast.warning("Please select payment option")
    }

    toast.success("Order ceated")
    setOrderData({
      email: "",
      country: "pakistan",
      firstName: "",
      lastName: "",
      address: "",
      optionalAdress: "",
      city: "",
      postalCode: "",
      phone: 1,
      shippingCharges: 350,
      payment: "",
      products: [],
      totalItems: 1,
      totalAmmount: 1


    }
    )


  }



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
            <InputFields placeholder={"email"} name={"email"} value={OrderData.email} handler={changeHandler} type={"email"} />
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
            <select name="country" id="" value={OrderData.country} onChange={changeHandler} className="w-full border  px-2 py-3  ">
              <option value="pakistan"  >Pakistan</option>

            </select>

            {/* Names  */}
            <div className="flex items-center   gap-1 w-full mt-3">
              <div className='w-[50%]'>
                <InputFields placeholder={"First name"} handler={changeHandler} value={OrderData.firstName} type={"text"} name={"firstName"} />

              </div>
              <div className='w-[50%]'>
                <InputFields placeholder={"Last name"} handler={changeHandler} value={OrderData.lastName} type={"text"} name={"lastName"} />
              </div>

            </div>

            {/* Address  */}
            <div className='mt-3'>
              <InputFields placeholder={"Address"} type={"text"} name={"address"} handler={changeHandler} value={OrderData.address} />
            </div>

            {/* Address  */}
            <div className='mt-3'>
              <InputFields placeholder={"Address"} type={"text"} name={"Apartment, suite, stc. (optional)"} handler={changeHandler} value={OrderData.optionalAdress} />
            </div>

            {/* City  */}
            <div className="flex items-center   gap-1 w-full mt-3">
              <div className='w-[50%]'>
                <InputFields placeholder={"City"} type={"text"} name={"city"} handler={changeHandler} value={OrderData.city} />

              </div>
              <div className='w-[50%]'>
                <InputFields placeholder={"Postal Code"} type={"text"} name={"postalcode"} value={OrderData.postalCode} handler={changeHandler} />
              </div>

            </div>


            {/* Phone  */}
            <div className='mt-3'>
              <InputFields placeholder={"Phone"} type={"number"} name={"phone"} handler={changeHandler} value={OrderData.phone} />
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
              <Radio handler={changeHandler} name={"payment"} value={OrderData.payment} />

            </div>




          </div>
        </div>

        {/* Complete  */}
        <div className="mt-6">
          <button onClick={submitHandler} className="w-full bg-blue-400 py-1 px-4">Complete Order</button>
        </div>

      </div>

      {/* RIgth DIv  */}
      <div className="w-[48%] bg-[#F5F5F5]  py-2 ">

        {/* Main div  */}
        <div className="px-8 mt-6 ">

          {itemsData.map((e) => {
            return <div key={e._id} className="flex gap-4 justify-between items-center mt-4  md:max-w-[380px]">
              {/* Image div  */}
              <div className='relative w-[60px] h-[60px] border-2 rounded-xl flex justify-center items-center border-white'>
                <Image src={e.image.file || "/imageholder.png"} width={50} height={50} alt='logo' />
                <div className='absolute p-1 top-0 right-0 w-4 h-4 rounded-full flex justify-center items-center text-sm bg-black text-white'>
                  {e.quantity}
                </div>
              </div>
              {/* Title div  */}
              <div className='w-[180px]'>
                <p className='text-sm font-semibold'>{e.title}</p>
              </div>
              {/* Price  */}
              <div>
                <p>Rs {e.price}.00</p>
              </div>

            </div>
          })}



          <div className='flex flex-col gap-2 mt-6 md:max-w-[380px]'>
            <div className='flex justify-between'>
              <p>Subtotal . {cartCount} items</p>
              <p>Rs {cartTotal}.00</p>
            </div>

            <div className='flex justify-between'>
              <p>Shipping</p>
              <p>Rs 350</p>
            </div>


            <div className='flex justify-between'>
              <p>Total</p>
              <p>Rs {cartTotal + 350}</p>
            </div>
          </div>

        </div>

      </div>
      <ToastContainer />

    </div>
  )
}

export default page
