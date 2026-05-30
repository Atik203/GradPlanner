import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Document } from "../../../types";

interface DocumentState {
  items: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  items: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments(state, action: PayloadAction<Document[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addDocument(state, action: PayloadAction<Document>) {
      state.items.unshift(action.payload);
    },
    updateDocument(state, action: PayloadAction<Document>) {
      const idx = state.items.findIndex((item) => item.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    deleteDocument(state, action: PayloadAction<string>) {
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
  setDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  setLoading,
  setError,
} = documentSlice.actions;

export default documentSlice.reducer;
