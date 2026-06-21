import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login, logout } from '../API';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(user => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  async function handleLogin(username, password) {
    const loggedUser = await login(username, password);
    setUser(loggedUser);
  }

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loggedIn: user !== null,
      checkingAuth,
      handleLogin,
      handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };



//I used React Context for authentication because several components need to know 
// if the user is logged in. Without Context, 
// I would need to pass the user and login/logout functions through many props.