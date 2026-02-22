
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { AuthService } from '../../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getSavedUser = (): User | null => {
  try {
    const saved = localStorage.getItem('SROTS_USER_SESSION');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to parse saved user session', e);
    return null;
  }
};

const initialState: AuthState = {
  user: getSavedUser(),
  isAuthenticated: !!getSavedUser(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;

      // Save standardized session keys
      localStorage.setItem('token', action.payload.token || localStorage.getItem('token') || '');
      localStorage.setItem('role', action.payload.role || '');
      localStorage.setItem('premiumActive', String(action.payload.premiumActive || false));

      // Legacy compatibility
      localStorage.setItem('SROTS_USER_SESSION', JSON.stringify(action.payload));
      localStorage.setItem('SROTS_ACCOUNT_STATUS', action.payload.accountStatus || 'ACTIVE');
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clean ALL auth data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('premiumActive');

      localStorage.removeItem('SROTS_AUTH_TOKEN');
      localStorage.removeItem('SROTS_USER_SESSION');
      localStorage.removeItem('SROTS_ACCOUNT_STATUS');

      // Force navigation to login
      window.location.hash = '';
      window.location.pathname = '/';
      // Do NOT reload here — let App.tsx handle it via !currentUser
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('SROTS_USER_SESSION', JSON.stringify(action.payload));
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;

export const login = (credentials: { username: string; password?: string }) => async (dispatch: any) => {
  dispatch(loginStart());
  try {
    const user = await AuthService.authenticateUser(credentials.username, credentials.password);
    dispatch(loginSuccess(user));
    return user; // Return user for caller
  } catch (err: any) {
    console.error('Authentication Error:', err);
    // Robust error message extraction
    const errorData = err.response?.data;
    const errorMessage = typeof errorData === 'string'
      ? errorData
      : (errorData?.message || 'Login failed. Please check your credentials.');

    dispatch(loginFailure(errorMessage));
    throw new Error(errorMessage); // Re-throw for caller
  }
};

export default authSlice.reducer;