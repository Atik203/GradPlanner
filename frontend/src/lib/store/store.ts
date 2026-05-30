import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";

import universityReducer from "./slices/universitySlice.js";
import professorReducer from "./slices/professorSlice.js";
import applicationReducer from "./slices/applicationSlice.js";
import documentReducer from "./slices/documentSlice.js";
import profileReducer from "./slices/profileSlice.js";

export const store = configureStore({
  reducer: {
    universities: universityReducer,
    professors: professorReducer,
    applications: applicationReducer,
    documents: documentReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
