import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const filterCandidates = createAsyncThunk(
  'leader/filterCandidates',
  async ({ filters = {}, page = 0, pageSize } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      (filters.programmingSkills || []).forEach((s) => params.append('programmingSkills', s));
      (filters.toolSkills || []).forEach((s) => params.append('toolSkills', s));
      (filters.frameworkSkills || []).forEach((s) => params.append('frameworkSkills', s));
      if (filters.certificate) params.append('certificate', filters.certificate);
      if (filters.cohortCode) params.append('cohortCode', filters.cohortCode);
      if (filters.deploymentLocation) params.append('deploymentLocation', filters.deploymentLocation);
      params.append('page', page);
      if (pageSize) params.append('pageSize', pageSize);

      const response = await axios.get(
        `${API_BASE_URL}/leader/candidates/filter?${params.toString()}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch candidates');
    }
  }
);

const initialFilters = {
  programmingSkills: [],
  toolSkills: [],
  frameworkSkills: [],
  certificate: '',
  cohortCode: '',
  deploymentLocation: '',
};

const leaderSlice = createSlice({
  name: 'leader',
  initialState: {
    candidates: [],
    filters: initialFilters,
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
    addSkillChip: (state, action) => {
      const { type, value } = action.payload;
      const v = (value || '').trim();
      if (!v) return;
      const list = state.filters[type];
      if (list && !list.some((s) => s.toLowerCase() === v.toLowerCase())) {
        list.push(v);
      }
    },
    removeSkillChip: (state, action) => {
      const { type, value } = action.payload;
      const list = state.filters[type];
      if (list) {
        state.filters[type] = list.filter((s) => s !== value);
      }
    },
    setFilterField: (state, action) => {
      const { field, value } = action.payload;
      state.filters[field] = value;
    },
    clearFilters: (state) => {
      state.filters = initialFilters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(filterCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload.content || [];
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
      .addCase(filterCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addSkillChip, removeSkillChip, setFilterField, clearFilters } = leaderSlice.actions;
export default leaderSlice.reducer;
