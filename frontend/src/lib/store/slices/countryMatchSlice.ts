import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MatchResult } from "../../matchScore";

interface CountryMatchState {
  /** Keyed by countryCode (e.g. "CA", "AU") */
  scores: Record<string, MatchResult>;
  /** True while profile is loading and scores haven't been computed yet */
  computed: boolean;
}

const initialState: CountryMatchState = {
  scores: {},
  computed: false,
};

const countryMatchSlice = createSlice({
  name: "countryMatch",
  initialState,
  reducers: {
    setMatchScores(state, action: PayloadAction<Record<string, MatchResult>>) {
      state.scores = action.payload;
      state.computed = true;
    },
    clearMatchScores(state) {
      state.scores = {};
      state.computed = false;
    },
  },
});

export const { setMatchScores, clearMatchScores } = countryMatchSlice.actions;
export default countryMatchSlice.reducer;
