import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  teams: [],
  matches: [],
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    addTeam: (state, action) => {
      state.teams.push(action.payload);
    },

    deleteTeam: (state, action) => {
      state.teams = state.teams.filter(
        t => t.id !== action.payload
      );
    },

    addMatch: (state, action) => {
      state.matches.push(action.payload);
    },
  },
});

export const { addTeam, deleteTeam, addMatch } = appSlice.actions;

export default appSlice.reducer;