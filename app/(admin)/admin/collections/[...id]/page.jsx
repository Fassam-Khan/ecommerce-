
"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcum";
import Input1 from "@/components/Input1";
import { Paper, Box } from "@mui/material";
import Button1 from "@/components/Button1";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Images from "@/components/Images";
import { useParams } from "next/navigation";

const Page = () => {
    const params = useParams();

    // For a route folder named [id]
    const collectId = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const [Category, setCategory] = useState({
        title: "",
        description: "",
        slug: "",
        file: "",
    });

    const [currentImg, setCurrentImg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Fetch existing collection
    useEffect(() => {
        if (!collectId) return;

        const getSingleColl = async () => {
            try {
                setLoading(true);

                const res = await axios.get(
                    `/api/categories/${collectId}`
                );

                // Supports either { category: {...} }
                // or a document returned directly.
                const data = res.data.category || res.data;

                setCategory({
                    title: data.title || "",
                    description: data.description || "",
                    slug: data.slug || "",
                    file: data.file || "",
                });

                if (data.file) {
                    setCurrentImg({ file: data.file });
                }
            } catch (error) {
                console.error(error);
                toast.error(
                    error.response?.data?.message ||
                    "Failed to fetch collection"
                );
            } finally {
                setLoading(false);
            }
        };

        getSingleColl();
    }, [collectId]);

    // Handle title, description and other form fields
    const changeHandler = (e) => {
        const { name, value } = e.target;

        setCategory((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Receive selected image from Images component
    const handleChildData = (childData, images) => {
        const selectedId = Array.isArray(childData)
            ? childData[0]
            : childData;

        const selectedImage = Array.isArray(images)
            ? images.find(
                (item) => item._id === selectedId
            )
            : null;

        if (selectedImage?.file) {
            setCurrentImg(selectedImage);
            setCategory((prev) => ({
                ...prev,
                file: selectedImage.file,
            }));
        }
    };

    // Create slug from title
    const createSlug = (title) => {
        return `collections/${title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")}`;
    };

    // Update existing collection
    const submitHandler = async () => {
        if (!Category.title.trim()) {
            return toast.warning("Please fill title");
        }

        try {
            setUpdating(true);

            const updatedData = {
                title: Category.title.trim(),
                description: Category.description,
                slug: createSlug(Category.title),
                file: currentImg?.file || Category.file || "",
            };

            const res = await axios.put(
                `/api/categories/${collectId}`,
                updatedData
            );

            toast.success(
                res.data.message ||
                "Collection updated successfully"
            );

            // Keep the form populated with the saved data
            setCategory({
                ...updatedData,
            });
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update collection"
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                Loading collection...
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb
                title="Collections"
                titleSlug="/admin/collections"
                activeSlug={`/admin/collections/${collectId}`}
                active="Edit Collection"
            />

            <div className="w-full max-w-[600px] mx-auto mt-16 px-4">
                <Paper className="flex gap-5 px-4 py-4">
                    <Box className="w-full flex flex-col gap-4">

                        {/* Collection title */}
                        <Box>
                            <Input1
                                name="title"
                                value={Category.title}
                                type="text"
                                handler={changeHandler}
                                placeholder="Enter title"
                                width="100%"
                            />
                        </Box>

                        {/* Collection description */}
                        <Box className="flex flex-col gap-1">
                            <label htmlFor="description">
                                Enter Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={Category.description}
                                onChange={changeHandler}
                                rows={5}
                                className="px-2 outline outline-gray-300 py-1"
                                placeholder="Enter description"
                            />
                        </Box>

                        {/* Collection image */}
                        <Box>
                            <label className="block mb-2">
                                Collection Image
                            </label>

                            {currentImg?.file ? (
                                <Box className="flex flex-col gap-3">
                                    <img
                                        src={currentImg.file}
                                        alt="Collection preview"
                                        width={120}
                                        height={120}
                                        className="w-[120px] h-[120px] object-cover rounded"
                                    />

                                    <Box>
                                        <Images
                                            title="Change Image"
                                            onSendToParent={handleChildData}
                                        />
                                    </Box>
                                </Box>
                            ) : (
                                <Box className="w-[120px] h-[120px] border border-dashed flex justify-center items-center">
                                    <Images
                                        title="Select Image"
                                        onSendToParent={handleChildData}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Update button */}
                        <Box className="!mt-4 flex justify-end">
                            <Button1
                                message={
                                    updating
                                        ? "Updating..."
                                        : "Update Collection"
                                }
                                handler={submitHandler}
                            />
                        </Box>

                    </Box>
                </Paper>
            </div>

            <ToastContainer />
        </div>
    );
};

export default Page;
