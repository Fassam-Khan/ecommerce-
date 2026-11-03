import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    number: 1000,
}

export const counterSlice = createSlice({
    name:"counter",
    initialState,
    reducers: {
        increament: (state)=>{
            state.value += 1
        }
    }
})



export const {increament} = counterSlice.actions;


export default counterSlice.reducer;