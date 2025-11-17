
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PostForm = {
    content:string ;
    error:string | null
}

const initialState:PostForm = {
    content:"",
    error:null
}

const postFormSlice = createSlice({
    name:"postForm",
    initialState,
    reducers:{
        setContent:(state,action:PayloadAction<string >)=>{
            state.content = action.payload;
        },
        clearContent:(state) =>{
            state.content = "";
        },
        setError:(state,action:PayloadAction<string | null>)=>{
            state.error = action.payload;
        },
        clearError:(state) =>{
            state.error = null;
        },
       
    },
});

export const { setContent,clearContent,setError,clearError } = postFormSlice.actions;

export default postFormSlice.reducer;