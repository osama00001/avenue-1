import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/wishlist");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch wishlist");
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async ({ bookId }, { rejectWithValue }) => {
    try {
      const res = await api.post("/wishlist", { bookId });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update wishlist");
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async ({ bookId }, { rejectWithValue }) => {
    try {
      const res = await api.delete("/wishlist", { data: { bookId } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to remove from wishlist");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    bookIds: [],
    loading: false,
    syncing: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.bookIds = action.payload.bookIds || [];
        state.loading = false;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlist.pending, (state) => {
        state.syncing = true;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.bookIds = action.payload.bookIds || [];
        state.syncing = false;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.syncing = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.bookIds = action.payload.bookIds || [];
        state.syncing = false;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      });
  },
});

export default wishlistSlice.reducer;
