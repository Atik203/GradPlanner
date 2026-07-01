import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  unreadCount: 0,
  loading: true,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
      state.loading = false;
    },
    decrementUnreadCount(state) {
      if (state.unreadCount > 0) state.unreadCount--;
    },
    resetUnreadCount(state) {
      state.unreadCount = 0;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setUnreadCount, decrementUnreadCount, resetUnreadCount, setLoading } =
  notificationSlice.actions;

export default notificationSlice.reducer;
