import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085';

// Get auth token from localStorage
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const parseApiError = (errorData) => {
  if (!errorData) return 'Failed to upload Excel';
  if (typeof errorData === 'string') return errorData;
  if (Array.isArray(errorData.errors)) {
    return {
      message: errorData.schemaValidationMessage || 'Upload validation failed',
      errors: errorData.errors,
    };
  }
  if (errorData.message) {
    return {
      message: errorData.message,
      errors: errorData.errors || [],
    };
  }
  return JSON.stringify(errorData);
};

// Async thunk for uploading Excel
export const uploadExcel = createAsyncThunk(
  'admin/uploadExcel',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/admin/candidate/upload`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(parseApiError(error.response?.data));
    }
  }
);

// Async thunk for getting all candidates with pagination
export const getAllCandidates = createAsyncThunk(
  'admin/getAllCandidates',
  async ({ page = 0, pageSize = undefined } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (pageSize) {
        params.append('pageSize', pageSize);
      }
      const response = await axios.get(`${API_BASE_URL}/admin/allcandidates?${params}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch candidates');
    }
  }
);

// Async thunk for getting candidate by ID (admin)
export const getCandidateByIdAdmin = createAsyncThunk(
  'admin/getCandidateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/candidate?id=${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch candidate');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    candidates: [],
    uploadResult: null,
    currentCandidate: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUploadResult: (state) => {
      state.uploadResult = null;
    },
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadResult = null;
      })
      .addCase(uploadExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadResult = action.payload;
      })
      .addCase(uploadExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload.content || action.payload;
        if (action.payload.currentPage !== undefined) {
          state.pagination = {
            currentPage: action.payload.currentPage,
            pageSize: action.payload.pageSize,
            totalElements: action.payload.totalElements,
            totalPages: action.payload.totalPages,
            isLast: action.payload.isLast,
          };
        }
      })
      .addCase(getAllCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCandidateByIdAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCandidateByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCandidate = action.payload;
      })
      .addCase(getCandidateByIdAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearUploadResult, clearCurrentCandidate } = adminSlice.actions;
export default adminSlice.reducer;