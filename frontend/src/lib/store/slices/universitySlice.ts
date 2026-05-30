import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { University } from "../../../types";

interface UniversityState {
  items: University[];
  loading: boolean;
  error: string | null;
}

const initialState: UniversityState = {
  items: [],
  loading: false,
  error: null,
};

const universitySlice = createSlice({
  name: "universities",
  initialState,
  reducers: {
    setUniversities(state, action: PayloadAction<University[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addUniversity(state, action: PayloadAction<University>) {
      state.items.unshift(action.payload);
    },
    updateUniversity(state, action: PayloadAction<University>) {
      const idx = state.items.findIndex((item) => item.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    deleteUniversity(state, action: PayloadAction<string>) {
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
  setUniversities,
  addUniversity,
  updateUniversity,
  deleteUniversity,
  setLoading,
  setError,
} = universitySlice.actions;

export default universitySlice.reducer;
