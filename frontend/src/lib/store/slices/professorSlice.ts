import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Professor } from "../../../types";

interface ProfessorState {
  items: Professor[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfessorState = {
  items: [],
  loading: false,
  error: null,
};

const professorSlice = createSlice({
  name: "professors",
  initialState,
  reducers: {
    setProfessors(state, action: PayloadAction<Professor[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addProfessor(state, action: PayloadAction<Professor>) {
      state.items.unshift(action.payload);
    },
    updateProfessor(state, action: PayloadAction<Professor>) {
      const idx = state.items.findIndex((item) => item.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    deleteProfessor(state, action: PayloadAction<string>) {
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
  setProfessors,
  addProfessor,
  updateProfessor,
  deleteProfessor,
  setLoading,
  setError,
} = professorSlice.actions;

export default professorSlice.reducer;
