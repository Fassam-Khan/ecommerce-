"use client"
import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const SearchInput = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [status, setStatus] = useState(searchParams.get('status') || 'all')

    // debounce: typing rukne ke 400ms baad URL update hoga
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (status !== 'all') params.set('status', status)

            const query = params.toString()
            router.replace(query ? `${pathname}?${query}` : pathname)
        }, 400)

        return () => clearTimeout(timer)
    }, [search, status])

    return (
        <div className='w-full relative py-0.5 outline outline-gray-300 rounded-2xl px-3 py-1 text-[12px]'>
            <div className='absolute left-2 bg-gray-300 px-2 rounded-2xl'>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className='cursor-pointer text-[12px] outline-none focus:bg-gray-300'
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            <Search className='absolute left-24 w-4 h-4 top-1/5' />

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full text-[12px] outline-none ml-27'
                placeholder='Search and filter'
            />
        </div>
    )
}

export default SearchInput