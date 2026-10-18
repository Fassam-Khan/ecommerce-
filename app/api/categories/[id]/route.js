
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import mongoose from "mongoose";

// GET: Fetch a single collection
export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid collection ID" },
                { status: 400 }
            );
        }

        const category = await Category.findById(id);

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Collection not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                category,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET category error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch collection" },
            { status: 500 }
        );
    }
}


// PUT: Update an existing collection
export async function PUT(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid collection ID" },
                { status: 400 }
            );
        }

        const body = await request.json();

        const { title, description, slug, file } = body;

        // Basic validation
        if (!title || !title.trim()) {
            return NextResponse.json(
                { success: false, message: "Title is required" },
                { status: 400 }
            );
        }

        // Update only the allowed fields
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: title.trim(),
                    description: description ?? "",
                    slug,
                    file: file ?? "",
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedCategory) {
            return NextResponse.json(
                { success: false, message: "Collection not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Collection updated successfully",
                category: updatedCategory,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUT category error:", error);

        // For example, a duplicate unique slug
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This slug already exists",
                },
                { status: 409 }
            );
        }

        if (error.name === "ValidationError") {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update collection",
            },
            { status: 500 }
        );
    }
}
