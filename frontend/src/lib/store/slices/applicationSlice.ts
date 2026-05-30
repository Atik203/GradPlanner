import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Application } from "../../../types";

interface ApplicationState {
  items: Application[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  items: [],
  loading: false,
  error: null,
};

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setApplications(state, action: PayloadAction<Application[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addApplication(state, action: PayloadAction<Application>) {
      state.items.unshift(action.payload);
    },
    updateApplication(state, action: PayloadAction<Application>) {
      const idx = state.items.findIndex((item) => item.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    deleteApplication(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  setLoading,
  setError,
} = applicationSlice.actions;

export default applicationSlice.reducer;
