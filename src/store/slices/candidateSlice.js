import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085';

// Get auth token from localStorage
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Async thunk for getting candidate by ID
export const getCandidateById = createAsyncThunk(
  'candidate/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trainee/candidate?id=${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch candidate');
    }
  }
);

// Async thunk for updating skills
export const updateSkills = createAsyncThunk(
  'candidate/updateSkills',
  async ({ candidateId, skills }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainee/skill/${candidateId}`, skills, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update skills');
    }
  }
);

// Async thunk for adding certification
export const addCertification = createAsyncThunk(
  'candidate/addCertification',
  async ({ certification, candidateId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainee/certificate/${candidateId}`, certification, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add certification');
    }
  }
);

// Async thunk for updating certification
export const updateCertification = createAsyncThunk(
  'candidate/updateCertification',
  async ({ certification, certificationId }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/trainee/certificate/${certificationId}`, certification, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update certification');
    }
  }
);

// Async thunk for deleting certification
export const deleteCertification = createAsyncThunk(
  'candidate/deleteCertification',
  async (certificationId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/trainee/certificate/${certificationId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete certification');
    }
  }
);

// Async thunk for adding project
export const addProject = createAsyncThunk(
  'candidate/addProject',
  async ({ project, candidateId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainee/project/${candidateId}`, project, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add project');
    }
  }
);

// Async thunk for updating project
export const updateProject = createAsyncThunk(
  'candidate/updateProject',
  async ({ project, projectId }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainee/project/${projectId}`, project, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update project');
    }
  }
);

// Async thunk for deleting project
export const deleteProject = createAsyncThunk(
  'candidate/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/trainee/project/${projectId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete project');
    }
  }
);

// Async thunk for adding achievement
export const addAchievement = createAsyncThunk(
  'candidate/addAchievement',
  async ({ achievement, candidateId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trainee/achievement/${candidateId}`, achievement, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add achievement');
    }
  }
);

// Async thunk for updating achievement
export const updateAchievement = createAsyncThunk(
  'candidate/updateAchievement',
  async ({ achievement, achievementId }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trainee/achievement/${achievementId}`, achievement, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update achievement');
    }
  }
);

// Async thunk for deleting achievement
export const deleteAchievement = createAsyncThunk(
  'candidate/deleteAchievement',
  async (achievementId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/trainee/achievement/${achievementId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete achievement');
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: {
    currentCandidate: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCandidateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCandidateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCandidate = action.payload;
      })
      .addCase(getCandidateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSkills.fulfilled, (state, action) => {
        state.loading = false;
        // Update skills in current candidate if it exists
        if (state.currentCandidate) {
          state.currentCandidate.skills = action.payload;
        }
      })
      .addCase(updateSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;