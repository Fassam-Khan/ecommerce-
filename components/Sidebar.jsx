import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import InboxIcon from '@mui/icons-material/Inbox';

export default function Sidebar() {

  const Menue= [
    {
      name: "Home",
      id:1,
      slug:"",
      icon:<HomeIcon sx={{width:"20px"}}/>
    },
    {
      name: "Orders",
      id:2,
      slug:"",
      icon: <InboxIcon sx={{width:"20px"}}/>
    },
    {
      name: "Products",
      id:3,
      slug:"",
      icon: <LoyaltyIcon sx={{width:"20px"}}/>
    },
    {
      name: "All Products",
      id:9,
      slug:"/admin/products",
      icon:""
    },
    {
      name: "Add Products",
      id:4,
      slug:"/admin/products/new",
      icon:""
    },
    {
      name: "Collections",
      id:5,
      slug:"/admin/collections",
      icon:""
    },
    { 
      name: "Add Collection",
      id:6,
      slug:"/admin/collections/new",
      icon:""
    },
    {
      name: "Media",
      id:7,
      slug:"/admin/media",
      icon:""
    },
  ]



  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', backgroundColor: "#0A0A0A" }}>
      <nav aria-label="main mailbox folders">
        <List>
          <ListItem>
            <p >Logo Here</p>
          </ListItem>
          {Menue.map((e)=>{
            return <Link href={e.slug} key={e.id} > 
            <ListItem className='flex gap-2 cursor-pointer'>
              <div className='w-[20px]'>
                {e.icon}
              </div>
              <p className="text-[14px]">{e.name}</p>
            </ListItem>
          </Link>
          })}

        
          


        </List>
      </nav>
      
      
    </Box>
  );
}
