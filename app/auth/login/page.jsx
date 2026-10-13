"use client"
import Button1 from '@/components/Button1'
import Input1 from '@/components/Input1'
import { Paper, Box } from '@mui/material'
import { useState } from 'react'
import React from 'react'
import { ToastContainer , toast} from 'react-toastify'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

const page = () => {

  const router = useRouter()
const [LoginData, setLoginData] = useState({
  email:"",
  password:""
})


const changeHandler =(e)=>{
  const {name , value} = e.target

  setLoginData((prev)=> ({...prev, [name]:value}))

}

const submitHandler = async ()=>{
  console.log("May chala");

  try {
    if(!LoginData.email){
      return toast.warning("Please enter email")
    }
    if(!LoginData.password){
      return toast.warning("Please enter password")
    }
    if(LoginData.password.length < 6){
      return toast.warning("Please enter correct password")
    }
    let user = await signInWithEmailAndPassword(auth, LoginData.email, LoginData.password)
    if(user){
      console.log(user);
      toast.success("User login successfully")
      setLoginData({
        email: "",
        password:""
      })
      router.push('/admin')
      
    }
  
  } catch (error) {
    console.log(error.message);
    
  }

}

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <Paper className='px-4 py-2 md:w-[370px]'>
        {/* Heading  */}
        <Box>
          <h2 className='text-center text-xl font-bold'>Login</h2>
        </Box>

        {/* Form  */}
        <Box className="mt-6 flex flex-col gap-6">
          <Input1 handler={changeHandler} type={'email'} name={"email"} placeholder={"Enter email"} width={"100%"} />
          <Input1 handler={changeHandler} type={'password'} name={"password"} placeholder={"Enter password"} width={"100%"} />
        </Box>
        <Box className="mt-6 flex justify-end">
          <Button1  handler={submitHandler} message={"Login"}/>
        </Box>

      </Paper>


      <ToastContainer/>

    </div>
  )
}

export default page
