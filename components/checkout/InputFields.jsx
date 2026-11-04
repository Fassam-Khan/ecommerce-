import React from 'react'

const InputFields = ({ placeholder, type, name }) => {
    return (
        <div>
            <input type={type} placeholder={placeholder} name={name} className='outline-gray-300 w-full outline px-4 py-1 rounded-xl' />

        </div>
    )
}

export default InputFields
