"use client"
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import axios from 'axios';

const columns = [
  { field: 'id', headerName: 'ID', width: 220 },
  {
    field: 'file',
    headerName: 'Image',
    width: 90,
    sortable: false,
    renderCell: (params) =>
      params.value ? (
        <img
          src={params.value}
          alt=""
          style={{ width: 40, height: 40, objectFit: 'cover', marginTop: 5 }}
        />
      ) : null,
  },
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'products', headerName: 'Products', width: 130 },
];

export default function CollectionTable() {
  const [rows, setRows] = useState([])
  const [rowCount, setRowCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 })

  const getCollections = async () => {
    try{
        setLoading(true)
        const res = await axios.get(
          `/api/categories?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`
        )
        setRows(res.data.data.map((item) => ({ ...item, id: item._id })))
        setRowCount(res.data.total)
        setLoading(false)

    }catch{
        console.log(error)
    }finally{
        setLoading(false)
    }

   
  }

  useEffect(() => {
    getCollections()
  }, [paginationModel])

  return (
    <Paper sx={{ height: 500, width: '100%' , marginTop:"10px"}}>
     <DataGrid
  rows={rows}
  columns={columns}
  rowCount={rowCount}
  loading={loading}
  paginationMode="server"
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
  pageSizeOptions={[5, 10]}
  checkboxSelection
  sx={{ border: 0 }}
/>
    </Paper>
  );
}