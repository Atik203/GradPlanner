/**
 * settingsSlice.ts — Redux slice for user settings.
 *
 * The settings page is the only consumer in Phase 1, but the slice is here so
 * the bell-icon notification badge in a future phase can read `settings.emailDeadlineAlerts`
 * without an extra API call.
 *
 * State lives in Redux (not just useState) because:
 *   1. Multiple components will read these preferences later (notifications, dashboard hints).
 *   2. The data is small and infrequently changes — no perf concern.
 *   3. Keeps the Settings page decoupled from other feature slices.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserSettings } from "../../../types";

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  saving: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<UserSettings>) {
      state.settings = action.payload;
      state.loading = false;
      state.saving = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setSaving(state, action: PayloadAction<boolean>) {
      state.saving = action.payload;
      if (action.payload) state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
      state.saving = false;
    },
    /**
     * Optimistic patch: apply a partial change to settings immediately.
     * Used by the Settings page right before calling PUT, so the UI feels instant.
     * If the API call fails, the reducer should be re-dispatched with the original
     * settings to revert.
     */
    patchSettings(state, action: PayloadAction<Partial<UserSettings>>) {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
      }
    },
  },
});

export const { setSettings, setLoading, setSaving, setError, patchSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
