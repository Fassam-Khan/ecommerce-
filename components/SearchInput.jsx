"use client"
import React from 'react'
import { useState } from 'react'
import DropDown from './UI/DropDown'
import { Search } from 'lucide-react'

const SearchInput = () => {

    const [SelectedValue, setSelectedValue] = useState("")

    const handleChange = (e) => {
        setSelectedValue(e.target.value)
    }

    return (
        <div className='w-full relative py-0.5 outline  outline-gray-300 rounded-2xl px-3 py-1 text-[12px]'>
            <div className='absolute left-2 bg-gray-300 px-2  rounded-2xl '>
                <select name="filter" id="" onChange={handleChange} className='cursor-pointer text-[12px] outline-none focus:bg-gray-300 '>
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archeived">Archeive</option>

                </select>
            </div>

            <Search  className='absolute left-24 w-4 h-4 top-1/5' />


            <input type="text"  className='w-full text-[12px]  outline-none ml-27' placeholder='Search and filter '/>


        </div>
    )
}

export default SearchInput
