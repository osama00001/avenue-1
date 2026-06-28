import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCMSPages = createAsyncThunk(
  "cms/fetchPages",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/content/pages");
      return (res.data.data || []).map((entry) => ({
        id: entry.id,
        ...(entry.attributes ?? entry),
      }));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to load CMS pages"
      );
    }
  }
);

const cmsSlice = createSlice({
  name: "cms",

  initialState: {
    list: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchCMSPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCMSPages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCMSPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cmsSlice.reducer;
