"use client";

import { useState, useEffect } from "react";
import { Drawer, Box, Typography, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginDrawer() {
  const [open, setOpen] = useState(false);
 
  const [loading, setLoading] = useState(false);

   

 

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Search className="hover:text-[var(--brand-red)] cursor-pointer" />
      </button>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 350,
              borderRight: "1px solid #334155",
              fontFamily: '"Poppins", sans-serif',
            },
          },
        }}
      >
        <Box>
          <Box
            className="px-2"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography className="text-sm">SEARCH OUR SITE</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

       

        
        </Box>
      </Drawer>
    </>
  );
}