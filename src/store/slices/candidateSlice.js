import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sanitizeObject } from '../../utils/sanitize';
import {
  validateSkills,
  validateCertification,
  validateProject,
  validateAchievement,
} from '../../utils/validate';

const API_BASE_URL = 'http://localhost:8085';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const getAssociateById = createAsyncThunk(
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

export const updateSkills = createAsyncThunk(
  'candidate/updateSkills',
  async ({ associateId, skills }, { rejectWithValue }) => {
    const { valid, errors } = validateSkills(skills || {});
    if (!valid) return rejectWithValue({ message: 'Invalid skills', errors });
    const payload = sanitizeObject(skills);

    try {
      const response = await axios.put(`${API_BASE_URL}/trainee/skill/${associateId}`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update skills');
    }
  }
);

export const addCertification = createAsyncThunk(
  'candidate/addCertification',
  async ({ certification, associateId }, { rejectWithValue }) => {
    const { valid, errors } = validateCertification(certification || {});
    if (!valid) return rejectWithValue({ message: 'Invalid certification', errors });
    const payload = sanitizeObject(certification);

    try {
      const response = await axios.post(`${API_BASE_URL}/trainee/certificate/${associateId}`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add certification');
    }
  }
);

export const updateCertification = createAsyncThunk(
  'candidate/updateCertification',
  async ({ certification, certificationId }, { rejectWithValue }) => {
    // PATCH semantics — only validate fields actually being sent
    const partial = certification || {};
    const errors = [];
    if (partial.certificationName != null && String(partial.certificationName).trim() === '') {
      errors.push('Certification name must not be blank');
    }
    if (partial.certificationProvider != null && String(partial.certificationProvider).trim() === '') {
      errors.push('Certification provider must not be blank');
    }
    if (errors.length) return rejectWithValue({ message: 'Invalid certification update', errors });
    const payload = sanitizeObject(certification);

    try {
      const response = await axios.patch(`${API_BASE_URL}/trainee/certificate/${certificationId}`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update certification');
    }
  }
);

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

export const addProject = createAsyncThunk(
  'candidate/addProject',
  async ({ project, associateId }, { rejectWithValue }) => {
    const { valid, errors } = validateProject(project || {});
    if (!valid) return rejectWithValue({ message: 'Invalid project', errors });
    const payload = sanitizeObject(project);

    try {
      const response = await axios.post(`${API_BASE_URL}/trainee/project/${associateId}`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'candidate/updateProject',
  async ({ project, projectId }, { rejectWithValue }) => {
    const { valid, errors } = validateProject(project || {});
    if (!valid) return rejectWithValue({ message: 'Invalid project', errors });
    const payload = sanitizeObject(project);

    try {
      const response = await axios.put(`${API_BASE_URL}/trainee/project/${projectId}`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update project');
    }
  }
);

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

export const addAchievement = createAsyncThunk(
  'candidate/addAchievement',
  async ({ achievement, associateId }, { rejectWithValue }) => {
    const { valid, errors } = validateAchievement(achievement || {});
    if (!valid) return rejectWithValue({ message: 'Invalid achievement', errors });
    const payload = sanitizeObject(achievement);

    try {
      const response = await axios.post(`${API_BASE_URL}/trainee/achievement/${associateId}`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add achievement');
    }
  }
);

export const updateAchievement = createAsyncThunk(
  'candidate/updateAchievement',
  async ({ achievement, achievementId }, { rejectWithValue }) => {
    const { valid, errors } = validateAchievement(achievement || {});
    if (!valid) return rejectWithValue({ message: 'Invalid achievement', errors });
    const payload = sanitizeObject(achievement);

    try {
      const response = await axios.put(`${API_BASE_URL}/trainee/achievement/${achievementId}`, payload, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update achievement');
    }
  }
);

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

// Helper to register pending/fulfilled/rejected for mutation thunks
const addMutationCases = (builder, thunk) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.mutating = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state) => {
      state.mutating = false;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.mutating = false;
      state.error = action.payload;
    });
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: {
    currentCandidate: null,
    loading: false,
    mutating: false,
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
      .addCase(getAssociateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssociateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCandidate = action.payload;
      })
      .addCase(getAssociateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    addMutationCases(builder, updateSkills);
    addMutationCases(builder, addProject);
    addMutationCases(builder, updateProject);
    addMutationCases(builder, deleteProject);
    addMutationCases(builder, addCertification);
    addMutationCases(builder, updateCertification);
    addMutationCases(builder, deleteCertification);
    addMutationCases(builder, addAchievement);
    addMutationCases(builder, updateAchievement);
    addMutationCases(builder, deleteAchievement);
  },
});

export const { clearError, clearCurrentCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;
