import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import HomePage from './components/HomePage';
import ProductDetail from './components/ProductDetail';
import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Avatar, Box, Button, Switch, FormControlLabel } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeContext, ThemeProvider as CustomThemeProvider } from './ThemeContext';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && location.pathname !== '/signin' && location.pathname !== '/signup') {
      navigate('/signin');
    }
  }, [navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('custID');
    localStorage.removeItem('username');
    navigate('/signin');
  };

  const username = localStorage.getItem('username');
  const profilePicture = localStorage.getItem('profilePicture');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#424242' : '#fafafa', // Change to gray for dark mode
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div style={{ backgroundColor: darkMode ? '#424242' : '#fafafa', color: darkMode ? '#ffffff' : '#000000', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ backgroundColor: "#4caf50" }}> 
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Welcome to SHOPDEE
            </Typography>
            {username && (
              <Box display="flex" alignItems="center">
                <Typography variant="body1" sx={{ marginRight: 2 }}>
                  {username}
                </Typography>
                <Avatar src={`/public/assets/profile/${profilePicture}`} />
                <Button color="inherit" onClick={handleLogout} sx={{ marginLeft: 2 }}>
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Dark Mode"
          sx={{ position: 'fixed', bottom: 16, left: 16 }}
        />
        <Routes>
          <Route exact path='/signin' element={<SignIn />} />
          <Route exact path='/signup' element={<SignUp />} />
          <Route exact path='/homepage' element={<HomePage />} />
          <Route exact path='/profile' element={<Profile />} />
          <Route exact path="/products/:productID" element={<ProductDetail />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <CustomThemeProvider>
        <App />
      </CustomThemeProvider>
    </Router>
  );
}
