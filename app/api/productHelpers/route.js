import { NextResponse } from 'next/server'

const ALLOWED_FIELDS = [
    'title',
    'description',
    'img_url',
    'price',
    'costPrice',
    'isInventoryTrack',
    'stock',
    'sku',
    'barcode',
    'status',
    'collection',
    'varient',
]

// sirf allowed fields lo, taake koi extra field DB mein na jaye
export function pickProductFields(body = {}) {
    const data = {}
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key]
    }

    // khali sku / barcode unique index se takra jate hain, isliye hata do
    for (const key of ['sku', 'barcode']) {
        if (typeof data[key] === 'string') {
            data[key] = data[key].trim()
            if (data[key] === '') delete data[key]
        }
    }

    // inventory track band hai to stock 0
    if (data.isInventoryTrack === false) data.stock = 0

    return data
}

export function slugify(text = '') {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// ek jaisa error response
export function handleError(error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message)
        return NextResponse.json({ success: false, error: messages.join(', ') }, { status: 400 })
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field'
        return NextResponse.json(
            { success: false, error: `${field} already exists` },
            { status: 409 }
        )
    }

    console.error(error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
}