import { createContext, useCallback, useEffect, useReducer } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true
};

function reducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return { user: action.user, isAuthenticated: true, isLoading: false };
    case 'AUTH_CLEAR':
      return { user: null, isAuthenticated: false, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const persist = (auth) => {
    const accessToken = auth.access_token || auth.accessToken;
    const refreshToken = auth.refresh_token || auth.refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    dispatch({ type: 'AUTH_SUCCESS', user: auth.user });
  };

  const login = async (payload) => {
    dispatch({ type: 'AUTH_START' });
    const auth = await authApi.login(payload);
    persist(auth);
    toast.success('Welcome back');
    return auth;
  };

  const register = async (payload) => {
    dispatch({ type: 'AUTH_START' });
    const auth = await authApi.register(payload);
    persist(auth);
    toast.success('Account created');
    return auth;
  };

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      localStorage.clear();
      dispatch({ type: 'AUTH_CLEAR' });
      toast.success('Signed out');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      dispatch({ type: 'AUTH_CLEAR' });
      return;
    }
    authApi.me()
      .then((user) => dispatch({ type: 'AUTH_SUCCESS', user }))
      .catch(() => {
        localStorage.clear();
        dispatch({ type: 'AUTH_CLEAR' });
      });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
