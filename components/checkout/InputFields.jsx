import React from 'react'

const InputFields = ({ placeholder, type, name , value, handler }) => {
    return (
        <div>
            <input type={type} onChange={(e)=> handler(e)} value={value} placeholder={placeholder} name={name} className='outline-gray-300 w-full outline px-4 py-1 rounded-xl' />

        </div>
    )
}

export default InputFields
