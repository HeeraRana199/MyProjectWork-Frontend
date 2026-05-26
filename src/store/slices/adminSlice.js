import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sanitizeObject } from '../../utils/sanitize';
import { validateLeaderRegister } from '../../utils/validate';

const API_BASE_URL = 'http://localhost:8085';

// Get auth token from localStorage
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const parseApiError = (errorData) => {
  if (!errorData) return 'Failed to upload Excel';
  if (typeof errorData === 'string') return errorData;
  // Preserve any row counts the backend sent back on the failure path so the UI
  // can show "x saved / y merged / z rejected" alongside the error list.
  const counts = {
    totalRecords: errorData.totalRecords,
    savedRecords: errorData.savedRecords,
    mergedRecords: errorData.mergedRecords,
    rejectedRecords: errorData.rejectedRecords,
  };
  if (Array.isArray(errorData.errors)) {
    return {
      message: errorData.schemaValidationMessage || 'Upload validation failed',
      errors: errorData.errors,
      ...counts,
    };
  }
  if (errorData.message) {
    return {
      message: errorData.message,
      errors: errorData.errors || [],
      ...counts,
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

// Async thunk for deleting a candidate (admin only)
export const deleteCandidate = createAsyncThunk(
  'admin/deleteCandidate',
  async (associateId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/candidate/${associateId}`, {
        headers: getAuthHeaders(),
      });
      return { associateId, message: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete candidate');
    }
  }
);

// Fetch all active leaders (admin only)
export const getAllLeaders = createAsyncThunk(
  'admin/getAllLeaders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/leaders`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch leaders');
    }
  }
);

// Soft-delete a leader (sets active=false on the server). Admin only.
export const deleteLeader = createAsyncThunk(
  'admin/deleteLeader',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/leader/${userId}`, {
        headers: getAuthHeaders(),
      });
      return { userId, message: response.data?.message || 'Leader deactivated' };
    } catch (error) {
      const data = error.response?.data;
      const message =
        typeof data === 'string'
          ? data
          : data?.message || 'Failed to deactivate leader';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for registering a new Leader (admin only)
export const registerLeader = createAsyncThunk(
  'admin/registerLeader',
  async ({ email, password }, { rejectWithValue }) => {
    const { valid, errors } = validateLeaderRegister({ email, password });
    if (!valid) {
      return rejectWithValue(errors.join('; '));
    }
    const payload = { email: sanitizeObject(email), password };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/leaderRegister`,
        payload,
        { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const message =
        typeof data === 'string'
          ? data
          : data?.message || 'Failed to register leader';
      return rejectWithValue(message);
    }
  }
);

// ── Ingestion Logs ────────────────────────────────────────────────────────────
export const getIngestionLogs = createAsyncThunk(
  'admin/getIngestionLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/ingestion-logs`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ingestion logs');
    }
  }
);

export const getIngestionLogDetails = createAsyncThunk(
  'admin/getIngestionLogDetails',
  async (logId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/ingestion-logs/${logId}`, {
        headers: getAuthHeaders(),
      });
      return response.data; // { log: {...}, errors: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch ingestion log details');
    }
  }
);

// Async thunk for getting candidate by ID (admin)
export const getAssociateByIdAdmin = createAsyncThunk(
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
    leaderRegistrationResult: null,
    leaderRegistrationError: null,
    leaderRegistrationLoading: false,
    leaders: [],
    leadersLoading: false,
    leadersError: null,
    leaderDeletionLoading: false,
    leaderDeletionError: null,
    ingestionLogs: [],
    ingestionLogsLoading: false,
    ingestionLogDetails: null,
    ingestionLogDetailsLoading: false,
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
    clearLeaderRegistration: (state) => {
      state.leaderRegistrationResult = null;
      state.leaderRegistrationError = null;
    },
    clearIngestionLogDetails: (state) => {
      state.ingestionLogDetails = null;
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
      .addCase(getAssociateByIdAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssociateByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCandidate = action.payload;
      })
      .addCase(getAssociateByIdAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerLeader.pending, (state) => {
        state.leaderRegistrationLoading = true;
        state.leaderRegistrationError = null;
        state.leaderRegistrationResult = null;
      })
      .addCase(registerLeader.fulfilled, (state, action) => {
        state.leaderRegistrationLoading = false;
        state.leaderRegistrationResult = action.payload;
      })
      .addCase(registerLeader.rejected, (state, action) => {
        state.leaderRegistrationLoading = false;
        state.leaderRegistrationError = action.payload;
      })
      .addCase(getAllLeaders.pending, (state) => {
        state.leadersLoading = true;
        state.leadersError = null;
      })
      .addCase(getAllLeaders.fulfilled, (state, action) => {
        state.leadersLoading = false;
        state.leaders = action.payload || [];
      })
      .addCase(getAllLeaders.rejected, (state, action) => {
        state.leadersLoading = false;
        state.leadersError = action.payload;
      })
      .addCase(deleteLeader.pending, (state, action) => {
        state.leaderDeletionLoading = true;
        state.leaderDeletionError = null;
        // Optimistic remove — drop the leader from the visible list the instant
        // the click happens. action.meta.arg is the userId passed to the thunk.
        // If the API call later fails (.rejected), the calling component refetches
        // the list to restore the row.
        state.leaders = state.leaders.filter((l) => l.userId !== action.meta.arg);
      })
      .addCase(deleteLeader.fulfilled, (state) => {
        state.leaderDeletionLoading = false;
      })
      .addCase(deleteLeader.rejected, (state, action) => {
        state.leaderDeletionLoading = false;
        state.leaderDeletionError = action.payload;
      })
      .addCase(deleteCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = state.candidates.filter(
          (c) => c.associateId !== action.payload.associateId
        );
      })
      .addCase(deleteCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getIngestionLogs.pending, (state) => {
        state.ingestionLogsLoading = true;
      })
      .addCase(getIngestionLogs.fulfilled, (state, action) => {
        state.ingestionLogsLoading = false;
        state.ingestionLogs = action.payload || [];
      })
      .addCase(getIngestionLogs.rejected, (state) => {
        state.ingestionLogsLoading = false;
      })
      .addCase(getIngestionLogDetails.pending, (state) => {
        state.ingestionLogDetailsLoading = true;
        state.ingestionLogDetails = null;
      })
      .addCase(getIngestionLogDetails.fulfilled, (state, action) => {
        state.ingestionLogDetailsLoading = false;
        state.ingestionLogDetails = action.payload;
      })
      .addCase(getIngestionLogDetails.rejected, (state) => {
        state.ingestionLogDetailsLoading = false;
      });
  },
});

export const { clearError, clearUploadResult, clearCurrentCandidate, clearLeaderRegistration, clearIngestionLogDetails } = adminSlice.actions;
export default adminSlice.reducer;