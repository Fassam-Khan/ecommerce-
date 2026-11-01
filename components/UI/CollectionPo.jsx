"use client "
import React from 'react'
import Cart from './Cart'
import axios from 'axios'
import { useState } from 'react'

const CollectionPo = () => {

    const [limit, setlimit] = useState(50)
    const [page, setpage] = useState(1)

const getData = async ()=>{
    const res = await axios.get(`/api/products?page=${page}limit=${limit}`)
    console.log(res)


}

  return (
    <div>

        <Cart/>
      
    </div>
  )
}

export default CollectionPo
