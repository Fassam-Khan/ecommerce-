
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import axios from "axios";
import { toast } from "react-toastify";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: 400 },
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export default function DeleteModal({ id, onDeleted }) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        if (!loading) setOpen(false);
    };

    const handleDelete = async () => {
        if (!id) {
            toast.error("Collection ID is missing");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.delete(
                `/api/categories/${id}`
            );

            if (res.data.success) {
                toast.success(
                    res.data.message || "Collection deleted successfully"
                );

                setOpen(false);

                // Refresh or update the parent list
                if (onDeleted) {
                    onDeleted(id);
                }
            }
        } catch (error) {
            console.error("Delete error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete collection"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleOpen}
                className="p-1 text-[12px] bg-red-500 text-white cursor-pointer rounded"
            >
                Delete
            </button>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="delete-modal-title"
                aria-describedby="delete-modal-description"
            >
                <Box sx={style}>
                    <Typography
                        id="delete-modal-title"
                        variant="h6"
                        component="h2"
                        fontWeight="bold"
                    >
                        Delete Collection?
                    </Typography>

                    <Typography
                        id="delete-modal-description"
                        sx={{ mt: 2, mb: 3 }}
                    >
                        Are you sure you want to delete this collection?
                        This action cannot be undone.
                    </Typography>

                    <Box className="flex justify-end gap-2">
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? "Deleting..." : "Yes, Delete"}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}
