import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";

import universityReducer from "./slices/universitySlice";
import professorReducer from "./slices/professorSlice";
import applicationReducer from "./slices/applicationSlice";
import documentReducer from "./slices/documentSlice";
import profileReducer from "./slices/profileSlice";
import countryMatchReducer from "./slices/countryMatchSlice";

export const store = configureStore({
  reducer: {
    universities: universityReducer,
    professors: professorReducer,
    applications: applicationReducer,
    documents: documentReducer,
    profile: profileReducer,
    countryMatch: countryMatchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
