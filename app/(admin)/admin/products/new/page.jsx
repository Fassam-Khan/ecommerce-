"use client"
import Input1 from '@/components/Input1'
import { Box, Paper } from '@mui/material'
import { ChevronLeft, Tags } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'
import Images from "@/components/Images"
import Image from 'next/image'
import Toggle from '@/components/Toggle'
import axios from 'axios' 
import {toast , ToastContainer} from "react-toastify"

const emptyValue = { optionName: '', img_url: '', price: '', stock: '' }

const initialForm = {
    title: "",
    description: "",
    img_url: [],            // main media: [{ _id, file }]
    price: "",
    costPrice: "",
    isInventoryTrack: false,
    stock: "",
    sku: "",
    barcode: "",
    status: "draft",
    collection: [],
    varient: [
        {
            varientName: "",
            optionValues: [{ ...emptyValue }]
        }
    ]
}

const Page = () => {
    // ---------- main form (single source of truth) ----------
    const [Form, setForm] = useState(initialForm)

    // ---------- UI-only state ----------
    const [selectedIds, setSelectedIds] = useState([])
    const [isVarient, setisVarient] = useState(false)

    // available collections (yahan apna data / API ka data rakho)

    const [Collections, setCollections] = useState([
       
    ])

    useEffect(() => {
        async function getCollections() {
             const res = await axios.get("/api/categories")
             setCollections(res.data.data)
            
        }

        getCollections()
    
    }, [])
  

    // shortcuts for variant data
    const optionName = Form.varient[0].varientName
    const optionValues = Form.varient[0].optionValues

    // only rows that have a name show up in the table
    const filledVariants = optionValues.filter(v => v.optionName.trim() !== '')

    // ---------- profit / margin ----------
    const price = Number(Form.price) || 0
    const cost = Number(Form.costPrice) || 0
    const hasPriceData = Form.price !== '' && Form.costPrice !== ''
    const profit = price - cost
    const margin = price > 0 ? (profit / price) * 100 : 0

    // ---------- generic fields (title, price, costPrice, stock, sku, barcode) ----------
    const changeHandler = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    // ---------- description ----------
    // RichTextEditor must call onChange with the HTML string
    const handleDescription = (html) => {
        setForm(prev => ({ ...prev, description: html }))
    }

    // ---------- main media ----------
    const handleChildData = (childData, paintsImages, multipleImages) => {
        setForm(prev => ({ ...prev, img_url: multipleImages }))
    }

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const deleteImg = () => {
        setForm(prev => ({
            ...prev,
            img_url: prev.img_url.filter(item => !selectedIds.includes(item._id))
        }))
        setSelectedIds([])
    }

    // ---------- inventory ----------
    const handleCheckbox = (event) => {
        const checked = event.target.checked
        setForm(prev => ({
            ...prev,
            isInventoryTrack: checked,
            stock: checked ? prev.stock : ""
        }))
    }

    // ---------- variants ----------
    const setVariantName = (value) => {
        setForm(prev => ({
            ...prev,
            varient: [{ ...prev.varient[0], varientName: value }]
        }))
    }

    const setOptionValues = (updater) => {
        setForm(prev => {
            const current = prev.varient[0]
            return {
                ...prev,
                varient: [{ ...current, optionValues: updater(current.optionValues) }]
            }
        })
    }

    const handleAddValue = () => {
        setOptionValues(list => [...list, { ...emptyValue }])
    }

    // field can be "optionName", "price", "stock" or "img_url"
    const handleValueChange = (index, field, value) => {
        setOptionValues(list =>
            list.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        )
    }

    const handleDeleteValue = (index) => {
        const newValues = optionValues.filter((_, i) => i !== index)
        if (newValues.length === 0) {
            setisVarient(false)
            setForm(prev => ({
                ...prev,
                varient: [{ varientName: "", optionValues: [{ ...emptyValue }] }]
            }))
        } else {
            setOptionValues(() => newValues)
        }
    }

    // variant image upload: knows which row it belongs to
    const handleVariantImage = (index, multipleImages) => {
        const file = multipleImages?.[0]?.file
        if (!file) return
        handleValueChange(index, 'img_url', file)
    }

    // ---------- status ----------
    const handleStatus = (e) => {
        setForm(prev => ({ ...prev, status: e.target.value }))
    }

    // ---------- collections (multi select, slug save hota hai) ----------
    const toggleCollection = (slug) => {
        setForm(prev => ({
            ...prev,
            collection: prev.collection.includes(slug)
                ? prev.collection.filter(c => c !== slug)
                : [...prev.collection, slug]
        }))
    }

    // ---------- submit ----------
    const submitData = async () => {
        if (!Form.title.trim()) {
            alert('Title is required')
            return
        }
        if (Form.price === '') {
            alert('Price is required')
            return
        }

        const payload = {
            ...Form,
            price: Number(Form.price) || 0,
            costPrice: Number(Form.costPrice) || 0,
            stock: Form.isInventoryTrack ? Number(Form.stock) || 0 : 0,
            varient: isVarient && filledVariants.length > 0
                ? [{
                    varientName: optionName,
                    optionValues: filledVariants.map(v => ({
                        ...v,
                        price: Number(v.price) || 0,
                        stock: Number(v.stock) || 0
                    }))
                }]
                : []
        }

        console.log(payload)
        // TODO: yahan API call lagao, e.g.
        // await fetch('/api/products', { method: 'POST', body: JSON.stringify(payload) })
        const res = await axios.post("/api/products", payload);

        if (res.data.success) {
          toast.success("Product created successfully");
          setForm(initialForm)
        };
    }

    return (
        <div>
            {/* top Head  */}
            <div className='flex gap-3'>
                <Link href={'/admin/products'}>
                    <div className='relative group w-5 hover:bg-gray-300 transition-all h-5 flex justify-center items-center p-0.5 cursor-pointer rounded-full border border-gray-300'>
                        <ChevronLeft />
                        <div className='group-hover:flex absolute hidden top-5 bg-black text-white font-semibold text-[10px] px-2 py-1 rounded-2xl'>
                            Products
                        </div>
                    </div>
                </Link>
                <div className='text-[10px] font-semibold flex gap-2 '>
                    <Tags className='w-4 h-4' />
                    Products
                </div>
            </div>

            {/* Middle content  */}
            <div className='max-w-[1000px] mt-10 m-auto flex'>
                {/* left Div  */}
                <div className='w-[65%]'>
                    <h2 className='text-xl font-semibold'>Add Product</h2>

                    {/* form */}
                    <Paper className='w-full rounded-lg bg-white px-2 mt-4 py-3'>
                        {/* title */}
                        <Box>
                            <p className='text-sm font-semibold mb-3'>Title</p>
                            <Input1 type={"text"} value={Form.title} handler={changeHandler} name={"title"} width={"100%"} placeholder={"Add Title"} />
                        </Box>

                        {/* Description  */}
                        <Box className="mt-4">
                            <p className='text-sm font-semibold mb-3'>Description</p>
                            <RichTextEditor value={Form.description} onChange={handleDescription} />
                        </Box>

                        {/* Media  */}
                        <Box className="mt-4">
                            <p className='text-sm font-semibold mb-3'>Media</p>
                            {selectedIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={deleteImg}
                                    className="text-red-500 text-xs mb-2 cursor-pointer"
                                >
                                    Remove ({selectedIds.length})
                                </button>
                            )}
                            <div className="flex gap-2 flex-wrap">
                                {Form.img_url.map((e) => (
                                    <div key={e._id} className="border relative border-gray-300 group hover:bg-gray-200">
                                        <Image src={e.file} width={150} height={150} alt='product image' unoptimized />
                                        <div
                                            className={`absolute top-2 left-2 group-hover:flex ${selectedIds.includes(e._id) ? 'flex' : 'hidden'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(e._id)}
                                                onChange={() => toggleSelect(e._id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Images title={"Upload Images"} onSendToParent={handleChildData} />
                            </div>
                        </Box>
                    </Paper>

                    {/* Price */}
                    <Paper className='w-full rounded-lg bg-white px-2 mt-6 py-2'>
                        <Box className="mt-4">
                            <p className='text-sm font-semibold mb-3'>Price</p>

                            <div className="flex gap-2">
                                <Input1 type={"number"} name={"price"} handler={changeHandler} value={Form.price} placeholder={"Price"} />
                                <Input1 type={"number"} name={"costPrice"} handler={changeHandler} value={Form.costPrice} placeholder={"Cost Price"} />
                            </div>

                            <div className="flex gap-4 mt-4">
                                <div className="flex gap-2 items-center mt-2">
                                    <p className="text-sm font-semibold">Profit</p>
                                    <div className="min-w-[40px] px-2 h-5 bg-gray-300 text-[10px] flex justify-center items-center rounded-2xl">
                                        {hasPriceData ? profit.toFixed(2) : '-'}
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center mt-2">
                                    <p className="text-sm font-semibold">Margin</p>
                                    <div className="min-w-[40px] px-2 h-5 bg-gray-300 text-[10px] flex justify-center items-center rounded-2xl">
                                        {hasPriceData && price > 0 ? `${margin.toFixed(1)}%` : '-'}
                                    </div>
                                </div>
                            </div>
                        </Box>
                    </Paper>

                    {/* Inventory */}
                    <Paper className='mt-6 px-3 py-2'>
                        <Box>
                            {/* top head  */}
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold">Inventory</p>
                                <div className="flex gap-2 items-center">
                                    <p className="text-[10px]">Inventory Track</p>
                                    <Toggle handler={handleCheckbox} check={Form.isInventoryTrack} />
                                </div>
                            </div>

                            {Form.isInventoryTrack && (
                                <div className="border border-gray-300 px-2 py-1">
                                    <div className="flex text-[12px] justify-between px-2 py-0.5 items-center bg-gray-300 mt-2 text-sm rounded-2xl">
                                        <p>Location</p>
                                        <p>Quantity</p>
                                    </div>
                                    <div className="mt-3 px-2 flex justify-between">
                                        <div className="text-[12px]">Nazimabad Branch</div>
                                        <Input1 type={"number"} name={"stock"} handler={changeHandler} value={Form.stock} />
                                    </div>
                                </div>
                            )}

                            {/* More Details */}
                            <div className="mt-2 border-t border-gray-300 py-2">
                                <div>
                                    <p className="text-[12px] font-semibold">More Details</p>
                                </div>
                                {/* Sku and Barcode  */}
                                <div className="flex gap-2 mt-4">
                                    <Input1 type={"text"} name={"sku"} handler={changeHandler} value={Form.sku} placeholder={"Sku"} />
                                    <Input1 type={"text"} name={"barcode"} handler={changeHandler} value={Form.barcode} placeholder={"Barcode"} />
                                </div>
                            </div>
                        </Box>
                    </Paper>

                    {/* Variant  */}
                    <p className='text-sm font-semibold mt-4'>Variant</p>

                    <Paper className="w-full rounded-lg bg-white px-2 mt-4 py-1 relative">
                        <Box>
                            {isVarient ? (
                                <div className="border rounded border-gray-300 px-3 py-3">
                                    {/* Option Name */}
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[12px] font-semibold">Option Name</p>
                                        <input
                                            type="text"
                                            placeholder="e.g., Size, Color"
                                            value={optionName}
                                            onChange={(e) => setVariantName(e.target.value)}
                                            className="outline-gray-300 rounded-lg w-full px-4 text-[12px] outline py-1"
                                        />
                                    </div>

                                    {/* Option Values */}
                                    <div className="flex flex-col gap-3 mt-4">
                                        <p className="text-[12px] font-semibold">Option Values</p>

                                        {optionValues.map((val, index) => (
                                            <div key={index} className="relative flex items-center">
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Small, Red"
                                                    value={val.optionName}
                                                    onChange={(e) => handleValueChange(index, 'optionName', e.target.value)}
                                                    className="outline-gray-300 rounded-lg w-full px-4 text-[12px] outline py-1 pr-16"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteValue(index)}
                                                    className="absolute right-2 bg-red-500 rounded-2xl text-[10px] text-white px-2 py-0.5 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={handleAddValue}
                                            className="self-start text-[11px] text-blue-600 hover:underline cursor-pointer mt-1"
                                        >
                                            + Add another value
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setisVarient(true)}
                                    className="hover:bg-gray-100 text-[10px] cursor-pointer rounded-2xl px-2 py-1 transition-colors"
                                >
                                    Add option like size and color
                                </button>
                            )}

                            {/* Variants table: shows only when at least one value has a name */}
                            {isVarient && filledVariants.length > 0 && (
                                <table className="w-full mt-4">
                                    <thead className="bg-gray-300">
                                        <tr>
                                            <td className="text-sm font-semibold px-4 py-1"><input type="checkbox" /></td>
                                            <td className="text-sm font-semibold px-4 py-1">{optionName || 'Variant'}</td>
                                            <td className="text-sm font-semibold px-4 py-1">Price</td>
                                            <td className="text-sm font-semibold px-4 py-1">Available</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {optionValues.map((v, index) =>
                                            v.optionName.trim() === '' ? null : (
                                                <tr key={index}>
                                                    <td className="px-4 py-1 w-[6%]"><input type="checkbox" /></td>
                                                    <td className="flex gap-2 px-4 py-1 items-center">
                                                        {v.img_url ? (
                                                            <Image src={v.img_url} width={30} height={30} alt={v.optionName} unoptimized />
                                                        ) : (
                                                            <div className="w-[35px] h-[35px] flex justify-center items-center border">
                                                                <Images
                                                                    title={"Add"}
                                                                    isVarient={true}
                                                                    onSendToParent={(childData, paintsImages, multipleImages) =>
                                                                        handleVariantImage(index, multipleImages)
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <p>{v.optionName}</p>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            placeholder="Rs"
                                                            value={v.price}
                                                            onChange={(e) => handleValueChange(index, 'price', e.target.value)}
                                                            className="outline-gray-300 rounded-lg px-4 text-[12px] outline py-1"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={v.stock}
                                                            onChange={(e) => handleValueChange(index, 'stock', e.target.value)}
                                                            className="outline-gray-300 rounded-lg px-4 text-[12px] outline py-1"
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </Box>
                    </Paper>

                    {/* Save */}
                    <div className="flex justify-end mt-6 mb-10">
                        <button
                            type="button"
                            onClick={submitData}
                            className="bg-black text-white text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                        >
                            Save product
                        </button>
                    </div>
                </div>

                {/* Right Div  */}
                <div className="w-[35%] pl-4 flex flex-col gap-4">
                    <Paper className="px-3 py-3">
                        <Box>
                            <h2 className="text-sm font-semibold mb-2">Status</h2>
                            <select
                                value={Form.status}
                                onChange={handleStatus}
                                className="w-full outline outline-gray-300 rounded-lg px-3 py-1 text-[12px] bg-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </Box>
                    </Paper>

                    <Paper className="px-3 py-3">
                        <Box>
                            <h2 className="text-sm font-semibold mb-2">Collections</h2>
                            <div className="flex flex-col gap-1 max-h-[260px] overflow-y-auto">
                                {Collections.map((c) => (
                                    <label
                                        key={c.slug}
                                        className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-0.5"
                                            checked={Form.collection.includes(c.slug)}
                                            onChange={() => toggleCollection(c.slug)}
                                        />
                                        <span>
                                            <span className="block text-[12px] font-semibold">{c.title}</span>
                                            <span className="block text-[10px] text-gray-500">{c.description}</span>
                                        </span>
                                    </label>
                                ))}
                                {Collections.length === 0 && (
                                    <p className="text-[11px] text-gray-500 px-2">No collections yet</p>
                                )}
                            </div>
                            {Form.collection.length > 0 && (
                                <p className="text-[10px] text-gray-500 mt-2 px-2">
                                    {Form.collection.length} selected
                                </p>
                            )}
                        </Box>
                    </Paper>
                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}

export default Page