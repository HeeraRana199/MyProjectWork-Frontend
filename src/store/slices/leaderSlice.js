import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sanitizeText, sanitizeArray } from '../../utils/sanitize';

const sanitizeFilters = (filters = {}) => ({
  programmingSkills: sanitizeArray(filters.programmingSkills || []),
  toolSkills: sanitizeArray(filters.toolSkills || []),
  frameworkSkills: sanitizeArray(filters.frameworkSkills || []),
  certificate: sanitizeText(filters.certificate || ''),
  cohortCode: sanitizeText(filters.cohortCode || ''),
  deploymentLocation: sanitizeText(filters.deploymentLocation || ''),
  // Multi-value chip filter — accepts an array of strings, strips non-digits
  // per chip, drops blanks/dupes.
  associateId: Array.from(new Set(
    (Array.isArray(filters.associateId) ? filters.associateId : [])
      .map((v) => sanitizeText(String(v)).replace(/[^0-9]/g, ''))
      .filter((v) => v.length > 0)
  )),
});

const API_BASE_URL = 'http://localhost:8085';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const getAssociateByIdLeader = createAsyncThunk(
  'leader/getCandidateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leader/candidate?id=${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch candidate');
    }
  }
);

export const exportFilteredCandidates = createAsyncThunk(
  'leader/exportFilteredCandidates',
  async ({ filters = {} } = {}, { rejectWithValue }) => {
    const safe = sanitizeFilters(filters);
    try {
      const params = new URLSearchParams();
      safe.programmingSkills.filter(Boolean).forEach((s) => params.append('programmingSkills', s));
      safe.toolSkills.filter(Boolean).forEach((s) => params.append('toolSkills', s));
      safe.frameworkSkills.filter(Boolean).forEach((s) => params.append('frameworkSkills', s));
      if (safe.certificate) params.append('certificate', safe.certificate);
      if (safe.cohortCode) params.append('cohortCode', safe.cohortCode);
      if (safe.deploymentLocation) params.append('deploymentLocation', safe.deploymentLocation);
      safe.associateId.forEach((id) => params.append('associateId', id));

      const response = await axios.get(
        `${API_BASE_URL}/leader/candidates/export?${params.toString()}`,
        { headers: getAuthHeaders(), responseType: 'blob' }
      );

      // Pull filename from Content-Disposition if present, fall back to a default
      const disposition = response.headers['content-disposition'] || '';
      const match = /filename="?([^"]+)"?/i.exec(disposition);
      const filename = match ? match[1] : `candidates-${Date.now()}.csv`;

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { filename };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to export candidates');
    }
  }
);

export const fetchAllTalentCardsData = createAsyncThunk(
  'leader/fetchAllTalentCardsData',
  async ({ filters = {} } = {}, { rejectWithValue }) => {
    const safe = sanitizeFilters(filters);
    try {
      const params = new URLSearchParams();
      safe.programmingSkills.filter(Boolean).forEach((s) => params.append('programmingSkills', s));
      safe.toolSkills.filter(Boolean).forEach((s) => params.append('toolSkills', s));
      safe.frameworkSkills.filter(Boolean).forEach((s) => params.append('frameworkSkills', s));
      if (safe.certificate) params.append('certificate', safe.certificate);
      if (safe.cohortCode) params.append('cohortCode', safe.cohortCode);
      if (safe.deploymentLocation) params.append('deploymentLocation', safe.deploymentLocation);
      safe.associateId.forEach((id) => params.append('associateId', id));
      params.append('page', 0);
      params.append('pageSize', 10000);

      const headers = getAuthHeaders();
      const listResponse = await axios.get(
        `${API_BASE_URL}/leader/candidates/filter?${params.toString()}`,
        { headers }
      );
      const candidates = listResponse.data.content || [];
      if (candidates.length === 0) return [];

      const fullData = await Promise.all(
        candidates.map((c) =>
          axios
            .get(`${API_BASE_URL}/leader/candidate?id=${c.associateId}`, { headers })
            .then((res) => ({ ...res.data, associateId: c.associateId }))
        )
      );
      return fullData;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch talent cards data');
    }
  }
);

export const filterCandidates = createAsyncThunk(
  'leader/filterCandidates',
  async ({ filters = {}, page = 0, pageSize } = {}, { rejectWithValue }) => {
    const safe = sanitizeFilters(filters);
    try {
      const params = new URLSearchParams();
      safe.programmingSkills.filter(Boolean).forEach((s) => params.append('programmingSkills', s));
      safe.toolSkills.filter(Boolean).forEach((s) => params.append('toolSkills', s));
      safe.frameworkSkills.filter(Boolean).forEach((s) => params.append('frameworkSkills', s));
      if (safe.certificate) params.append('certificate', safe.certificate);
      if (safe.cohortCode) params.append('cohortCode', safe.cohortCode);
      if (safe.deploymentLocation) params.append('deploymentLocation', safe.deploymentLocation);
      safe.associateId.forEach((id) => params.append('associateId', id));
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
  associateId: [],
};

const leaderSlice = createSlice({
  name: 'leader',
  initialState: {
    candidates: [],
    currentCandidate: null,
    filters: initialFilters,
    loading: false,
    exporting: false,
    exportError: null,
    downloadingCards: false,
    downloadCardsError: null,
    allTalentCardsData: [],
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
    clearTalentCardsData: (state) => {
      state.allTalentCardsData = [];
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
      })
      .addCase(getAssociateByIdLeader.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssociateByIdLeader.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCandidate = action.payload;
      })
      .addCase(getAssociateByIdLeader.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(exportFilteredCandidates.pending, (state) => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportFilteredCandidates.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportFilteredCandidates.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload;
      })
      .addCase(fetchAllTalentCardsData.pending, (state) => {
        state.downloadingCards = true;
        state.downloadCardsError = null;
        state.allTalentCardsData = [];
      })
      .addCase(fetchAllTalentCardsData.fulfilled, (state, action) => {
        state.downloadingCards = false;
        state.allTalentCardsData = action.payload;
      })
      .addCase(fetchAllTalentCardsData.rejected, (state, action) => {
        state.downloadingCards = false;
        state.downloadCardsError = action.payload;
      });
  },
});

export const { addSkillChip, removeSkillChip, setFilterField, clearFilters, clearTalentCardsData } = leaderSlice.actions;
export default leaderSlice.reducer;
