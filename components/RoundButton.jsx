import React from 'react'

const RoundButton = ({title}) => {
  return (
    <div className='bg-black shadow-2xl text-white rounded-full px-3 hover:text-gray-300 py-0.5 cursor-pointer flex items-center justify-center text-[12px] font-semibold'>
        {title}
    </div>
  )
}

export default RoundButton
