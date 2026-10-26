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
import { toast, ToastContainer } from "react-toastify"
// Needed for react-toastify v10 and below. Remove this line if you use v11+.
import 'react-toastify/dist/ReactToastify.css'

const emptyValue = { optionName: '', img_url: '', price: '', stock: '' }

// "My New Product!" -> "my-new-product"
const slugify = (text = '') =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')   // remove special characters
        .replace(/[\s_-]+/g, '-')       // spaces/underscores -> single hyphen
        .replace(/^-+|-+$/g, '')        // trim hyphens from both ends

const META_TITLE_LIMIT = 60
const META_DESC_LIMIT = 160

// Factory function so every reset gets fresh nested objects/arrays
const getInitialForm = () => ({
    title: "",
    description: "",
    img_url: [],            // main media: [{ _id, file }]
    price: "",
    costPrice: "",
    isInventoryTrack: false,
    stock: "",
    sku: "",
    barcode: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    collection: [],
    varient: [
        {
            varientName: "",
            optionValues: [{ ...emptyValue }]
        }
    ]
})

// ---------- image upload helper ----------
// Blob/data URLs only exist in the browser, so they must be uploaded
// before saving. Adjust the endpoint + response shape to match your API.
const uploadIfLocal = async (src) => {
    if (!src || typeof src !== 'string') return src
    if (!src.startsWith('blob:') && !src.startsWith('data:')) return src // already a real URL

    const blob = await (await fetch(src)).blob()
    const fd = new FormData()
    fd.append('file', blob, 'image.' + (blob.type.split('/')[1] || 'png'))

    const res = await axios.post('/api/upload', fd)
    return res.data.url // expected: { url: "https://..." }
}

const Page = () => {
    // ---------- main form (single source of truth) ----------
    const [Form, setForm] = useState(getInitialForm)

    // ---------- UI-only state ----------
    const [selectedIds, setSelectedIds] = useState([])
    const [isVarient, setisVarient] = useState(false)
    const [saving, setSaving] = useState(false)
    // once the user types their own slug, stop auto-generating it from the title
    const [slugEdited, setSlugEdited] = useState(false)
    const [Collections, setCollections] = useState([])

    useEffect(() => {
        async function getCollections() {
            try {
                const res = await axios.get("/api/categories")
                setCollections(res.data.data || [])
            } catch (error) {
                console.log(error)
                toast.error("Failed to load collections")
            }
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

    // ---------- generic fields ----------
    const changeHandler = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
            // keep slug in sync with title until the user edits it manually
            ...(name === 'title' && !slugEdited ? { slug: slugify(value) } : {})
        }))
    }

    // ---------- slug ----------
    const handleSlugChange = (e) => {
        setSlugEdited(true)
        // allow typing hyphens mid-way; final cleanup happens on blur/submit
        const value = e.target.value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        setForm(prev => ({ ...prev, slug: value }))
    }

    const handleSlugBlur = () => {
        setForm(prev => ({ ...prev, slug: slugify(prev.slug) }))
    }

    const resetSlugFromTitle = () => {
        setSlugEdited(false)
        setForm(prev => ({ ...prev, slug: slugify(prev.title) }))
    }

    // ---------- description ----------
    const handleDescription = (html) => {
        setForm(prev => ({ ...prev, description: html }))
    }

    // ---------- main media ----------
    const handleChildData = (childData, paintsImages, multipleImages) => {
        setForm(prev => ({ ...prev, img_url: multipleImages || [] }))
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

    const removeVariantImage = (index) => {
        handleValueChange(index, 'img_url', '')
    }

    // ---------- status ----------
    const handleStatus = (e) => {
        setForm(prev => ({ ...prev, status: e.target.value }))
    }

    // ---------- collections (multi select, slug is saved) ----------
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
        if (saving) return

        // validation
        if (!Form.title.trim()) {
            toast.error('Title is required')
            return
        }
        const finalSlug = slugify(Form.slug || Form.title)
        if (!finalSlug) {
            toast.error('Slug is required')
            return
        }
        if (Form.price === '' || Number(Form.price) < 0) {
            toast.error('Enter a valid price')
            return
        }
        if (Form.costPrice !== '' && Number(Form.costPrice) < 0) {
            toast.error('Cost price cannot be negative')
            return
        }
        if (Form.isInventoryTrack && Form.stock !== '' && Number(Form.stock) < 0) {
            toast.error('Stock cannot be negative')
            return
        }
        if (isVarient && filledVariants.length > 0 && !optionName.trim()) {
            toast.error('Give the option a name (e.g. Size, Color)')
            return
        }

        setSaving(true)
        try {
            // 1) upload local images -> permanent URLs
            const uploadedMain = await Promise.all(
                Form.img_url.map(async (item) => ({
                    ...item,
                    file: await uploadIfLocal(item.file)
                }))
            )

            const uploadedVariants = await Promise.all(
                filledVariants.map(async (v) => ({
                    ...v,
                    img_url: await uploadIfLocal(v.img_url),
                    price: Number(v.price) || 0,
                    // variant stock only counts when inventory tracking is on
                    stock: Form.isInventoryTrack ? Number(v.stock) || 0 : 0
                }))
            )

            // 2) build payload
            const payload = {
                ...Form,
                sku: Form.sku.trim() || undefined,
                barcode: Form.barcode.trim() || undefined,
                slug: finalSlug,
                metaTitle: Form.metaTitle.trim(),
                metaDescription: Form.metaDescription.trim(),
                img_url: uploadedMain,
                price: Number(Form.price) || 0,
                costPrice: Number(Form.costPrice) || 0,
                stock: Form.isInventoryTrack ? Number(Form.stock) || 0 : 0,
                varient: isVarient && uploadedVariants.length > 0
                    ? [{ varientName: optionName, optionValues: uploadedVariants }]
                    : []
            }

            // 3) save
            const res = await axios.post("/api/products", payload)

            if (res.data.success) {
                toast.success("Product created successfully")
                setForm(getInitialForm())
                setisVarient(false)
                setSelectedIds([])
                setSlugEdited(false)
            } else {
                toast.error(res.data.message || "Failed to create product")
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || "Failed to create product")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            {/* top Head  */}
            <div className='flex gap-3'>
                <Link href={'/admin/products'} aria-label="Back to products">
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
                                                aria-label="Select image"
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
                                    <div className={`min-w-[40px] px-2 h-5 text-[10px] flex justify-center items-center rounded-2xl ${hasPriceData && profit < 0 ? 'bg-red-200 text-red-700' : 'bg-gray-300'}`}>
                                        {hasPriceData ? profit.toFixed(2) : '-'}
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center mt-2">
                                    <p className="text-sm font-semibold">Margin</p>
                                    <div className={`min-w-[40px] px-2 h-5 text-[10px] flex justify-center items-center rounded-2xl ${hasPriceData && profit < 0 ? 'bg-red-200 text-red-700' : 'bg-gray-300'}`}>
                                        {hasPriceData && price > 0 ? `${margin.toFixed(1)}%` : '-'}
                                    </div>
                                </div>
                            </div>
                            {hasPriceData && profit < 0 && (
                                <p className="text-[10px] text-red-600 mt-2">
                                    Cost price is higher than selling price.
                                </p>
                            )}
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
                                        <label htmlFor="option-name" className="text-[12px] font-semibold">Option Name</label>
                                        <input
                                            id="option-name"
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
                                                    aria-label={`Option value ${index + 1}`}
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
                                            <td className="text-sm font-semibold px-4 py-1">{optionName || 'Variant'}</td>
                                            <td className="text-sm font-semibold px-4 py-1">Price</td>
                                            {Form.isInventoryTrack && (
                                                <td className="text-sm font-semibold px-4 py-1">Available</td>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {optionValues.map((v, index) =>
                                            v.optionName.trim() === '' ? null : (
                                                <tr key={index}>
                                                    <td className="flex gap-2 px-4 py-1 items-center">
                                                        {v.img_url ? (
                                                            <div className="relative group">
                                                                <Image src={v.img_url} width={30} height={30} alt={v.optionName} unoptimized />
                                                                <button
                                                                    type="button"
                                                                    aria-label="Remove variant image"
                                                                    onClick={() => removeVariantImage(index)}
                                                                    className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 items-center justify-center rounded-full bg-red-500 text-white text-[9px] leading-none cursor-pointer"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
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
                                                            min="0"
                                                            aria-label={`Price for ${v.optionName}`}
                                                            placeholder="Rs"
                                                            value={v.price}
                                                            onChange={(e) => handleValueChange(index, 'price', e.target.value)}
                                                            className="outline-gray-300 rounded-lg px-4 text-[12px] outline py-1"
                                                        />
                                                    </td>
                                                    {Form.isInventoryTrack && (
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                aria-label={`Stock for ${v.optionName}`}
                                                                placeholder="0"
                                                                value={v.stock}
                                                                onChange={(e) => handleValueChange(index, 'stock', e.target.value)}
                                                                className="outline-gray-300 rounded-lg px-4 text-[12px] outline py-1"
                                                            />
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </Box>
                    </Paper>

                    {/* Search engine listing (SEO) */}
                    <p className='text-sm font-semibold mt-6'>Search engine listing</p>

                    <Paper className="w-full rounded-lg bg-white px-3 mt-4 py-3">
                        <Box>
                            {/* Preview */}
                            <div className="border border-gray-200 rounded-lg px-3 py-2 mb-4">
                                <p className="text-[14px] text-blue-700 truncate">
                                    {Form.metaTitle.trim() || Form.title.trim() || 'Product title'}
                                </p>
                                <p className="text-[11px] text-green-700 truncate">
                                    yourstore.com/products/{Form.slug || 'product-slug'}
                                </p>
                                <p className="text-[11px] text-gray-600 line-clamp-2">
                                    {Form.metaDescription.trim() || 'Add a meta description to control how this product appears in search results.'}
                                </p>
                            </div>

                            {/* Meta title */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="meta-title" className="text-[12px] font-semibold">Meta title</label>
                                    <span className={`text-[10px] ${Form.metaTitle.length > META_TITLE_LIMIT ? 'text-red-600' : 'text-gray-500'}`}>
                                        {Form.metaTitle.length}/{META_TITLE_LIMIT}
                                    </span>
                                </div>
                                <input
                                    id="meta-title"
                                    type="text"
                                    name="metaTitle"
                                    placeholder="Defaults to product title"
                                    value={Form.metaTitle}
                                    onChange={changeHandler}
                                    className="outline-gray-300 rounded-lg w-full px-4 text-[12px] outline py-1"
                                />
                            </div>

                            {/* Meta description */}
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="meta-description" className="text-[12px] font-semibold">Meta description</label>
                                    <span className={`text-[10px] ${Form.metaDescription.length > META_DESC_LIMIT ? 'text-red-600' : 'text-gray-500'}`}>
                                        {Form.metaDescription.length}/{META_DESC_LIMIT}
                                    </span>
                                </div>
                                <textarea
                                    id="meta-description"
                                    name="metaDescription"
                                    rows={3}
                                    placeholder="Short summary shown in search results"
                                    value={Form.metaDescription}
                                    onChange={changeHandler}
                                    className="outline-gray-300 rounded-lg w-full px-4 text-[12px] outline py-1 resize-none"
                                />
                            </div>

                            {/* Slug */}
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="slug" className="text-[12px] font-semibold">URL slug</label>
                                    {slugEdited && (
                                        <button
                                            type="button"
                                            onClick={resetSlugFromTitle}
                                            className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                                        >
                                            Generate from title
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="slug"
                                    type="text"
                                    name="slug"
                                    placeholder="my-product-name"
                                    value={Form.slug}
                                    onChange={handleSlugChange}
                                    onBlur={handleSlugBlur}
                                    className="outline-gray-300 rounded-lg w-full px-4 text-[12px] outline py-1"
                                />
                            </div>
                        </Box>
                    </Paper>

                    {/* Save */}
                    <div className="flex justify-end mt-6 mb-10">
                        <button
                            type="button"
                            onClick={submitData}
                            disabled={saving}
                            className="bg-black text-white text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save product'}
                        </button>
                    </div>
                </div>

                {/* Right Div  */}
                <div className="w-[35%] pl-4 flex flex-col gap-4">
                    <Paper className="px-3 py-3">
                        <Box>
                            <h2 className="text-sm font-semibold mb-2">Status</h2>
                            <select
                                aria-label="Product status"
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
            <ToastContainer />
        </div>
    )
}

export default Page