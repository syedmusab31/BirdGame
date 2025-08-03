import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('adminToken'),
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGIN_FAIL':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/auth/profile');
          
          if (response.data.success && response.data.user.isAdmin) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data.user,
                token,
              },
            });
          } else {
            localStorage.removeItem('adminToken');
            dispatch({ type: 'LOGIN_FAIL' });
          }
        } catch (error) {
          localStorage.removeItem('adminToken');
          dispatch({ type: 'LOGIN_FAIL' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await axios.post('/auth/login', { email, password });

      if (response.data.success && response.data.user.isAdmin) {
        const { token, user } = response.data;
        localStorage.setItem('adminToken', token);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        return { success: true };
      } else {
        dispatch({ type: 'LOGIN_FAIL' });
        return { success: false, message: 'Access denied. Admin privileges required.' };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await axios.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};