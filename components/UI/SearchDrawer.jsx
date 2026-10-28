"use client";

import { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Search } from "lucide-react";

export default function MyDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        variant="contained"
        onClick={() => setOpen(true)}
      >
        <Search className="hover:text-[var(--brand-red)] cursor-pointer"/>
      </button>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
             
              borderRight: "1px solid #334155",
             
            },
          },
        }}
      >
        <Box>
          <Box className="px-2 items-center"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography className="text-sm">
              SEARCH OUR SITE
            </Typography>

            <IconButton
              onClick={() => setOpen(false)}
              className="cursor-pointer hover:[var(--brand-red)]"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider/>

          <Box className="mt-5 px-2 shadow-xl py-3">
            <input placeholder="Search"   className="rounded-lg outline outline-gray-300 w-full px-3 py-1"/>
          </Box>

        
        </Box>
      </Drawer>
    </>
  );
}