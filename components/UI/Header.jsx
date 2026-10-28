import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import SearchDrawer from './SearchDrawer'

const Header = () => {

const Menue = [
    {
        id:1,
        url: "/collections/art-supplies",
        name:"Art Supplies",
    },
    {
        id:2,
        url: "/collections/art-resins",
        name:"Art Resins",
    },
    {
        id:3,
        url: "/collections/office-items",
        name:"Office Items",
    },
    {
        id:4,
        url: "/collections/school-essentials",
        name:"School Esentials",
    },
    {
        id:5,
        url: "/collections/gift-items",
        name:"Gift Items",
    },
    {
        id:6,
        url: "/collections/paper-sheets",
        name:"Paper & Sheets",
    }
]


    return (
        <div >
            {/* Main Head  */}
            <div className='flex h-[70px] justify-between items-center px-4'>
                {/* logo  */}
                <div>
                    <Image src={'/logo.webp'} width={180} height={100} alt='nazar-brothers-logo' />

                </div>

                {/* Nav Links  */}
                <div>
                    <ul className='flex gap-6'>
                        {Menue.map((e)=>{
                            return  <li key={e.id}>
                            <p className='font-semibold hover:text-[var(--brand-red)] transition-all'><Link href={e.url}>{e.name}</Link></p>
                        </li>
                        })}
                      

                     
                     
                    </ul>

                </div>

                {/* Icons DIv  */}
                <div>
                    <div>
                        <SearchDrawer/>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default Header
