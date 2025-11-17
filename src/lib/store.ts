
import { configureStore } from "@reduxjs/toolkit";
import postFormReducer from "@/lib/features/postForm/postformSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import uiReducer from './features/ui/uiSlice';

// ストアを作成する関数をエクスポート
export const makeStore = () => {
    return configureStore({
        reducer:{
            postForm:postFormReducer,
            ui: uiReducer,
        },
    });
};

// ストアの型を定義
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// カスタムフックをエクスポート
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


