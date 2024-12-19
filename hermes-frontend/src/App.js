import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login'; // The login component
import Register from './Register'; // The registration component
import Account from './Account'; // The registration component
import Dashboard from './Dashboard'; // The dashboard component
import PrivateRoute from './PrivateRoute';
import GroupChat from './GroupChat'; // The group chat component

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groupchat" element={<GroupChat />} />
          <Route path="/account" element={<Account />} />
        {/* Add more routes as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;