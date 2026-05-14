import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sanitizeObject } from '../../utils/sanitize';
import { validateLogin, validateRegister, validate, required, minLength } from '../../utils/validate';

const API_BASE_URL = 'http://localhost:8085'; // Adjust if needed

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const raw = { email, password };
    const { valid, errors } = validateLogin(raw);
    if (!valid) {
      return rejectWithValue({ message: 'Invalid login input', errors });
    }
    // Sanitize email (strip any HTML); password is sent as-typed by intent.
    const payload = { email: sanitizeObject(raw.email), password: raw.password };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
      console.log('Login response:', response.data);
      const { token, role, associateId } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('associateId', associateId?.toString());

      return response.data;
    } catch (error) {
      console.error('Login error:', error.response || error);
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

// Async thunk for registration
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    const { valid, errors } = validateRegister(userData);
    if (!valid) {
      return rejectWithValue({ message: 'Invalid registration input', errors });
    }
    const payload = {
      email: sanitizeObject(userData.email),
      password: userData.password,
      role: sanitizeObject(userData.role),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/registration`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Registration failed');
    }
  }
);

// Change password (authenticated user — old + new password)
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    const { valid, errors } = validate(
      { oldPassword, newPassword },
      {
        oldPassword: [required('Current password')],
        newPassword: [required('New password'), minLength('New password', 6)],
      }
    );
    if (!valid) return rejectWithValue({ message: 'Invalid input', errors });
    if (oldPassword === newPassword) {
      return rejectWithValue({
        message: 'Invalid input',
        errors: ['New password must be different from the current password'],
      });
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue({
        message: 'You are not logged in. Please log in again.',
        errors: [],
      });
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      const status = error.response?.status;

      // Pull a real message out of the response when one exists; otherwise fall back to a
      // status-aware default. Critical: never propagate an empty string as the message.
      let message;
      if (typeof data === 'string' && data.trim()) {
        message = data;
      } else if (data && typeof data === 'object' && data.message && String(data.message).trim()) {
        message = data.message;
      } else if (status === 401) {
        message = 'Your session has expired. Please log in again.';
      } else if (status === 403) {
        message = 'Not authorized. Your token may be invalid or expired — please log in again.';
      } else if (status) {
        message = `Failed to change password (HTTP ${status})`;
      } else {
        message = error.message || 'Failed to change password (no response from server)';
      }

      return rejectWithValue({
        message,
        errors: Array.isArray(data?.errors) ? data.errors : [],
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    candidateId: localStorage.getItem('candidateId'),
    loading: false,
    error: null,
    passwordChangeLoading: false,
    passwordChangeError: null,
    passwordChangeSuccess: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.candidateId = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('candidateId');
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordChangeState: (state) => {
      state.passwordChangeError = null;
      state.passwordChangeSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.candidateId = action.payload.candidateId;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.passwordChangeError = null;
        state.passwordChangeSuccess = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeSuccess =
          (action.payload && action.payload.message) || 'Password updated successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = action.payload;
      });
  },
});

export const { logout, clearError, clearPasswordChangeState } = authSlice.actions;
export default authSlice.reducer;