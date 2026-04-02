import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';

// Import our SASS foundation, not the old CSS file!
import './styles/App.scss';

export default function App() {
  return (
    // 1. The Engine
    <BrowserRouter>
      {/* 2. The Switchboard */}
      <Routes>
        {/* 3. The Specific Path */}
        <Route path="/" element={<Dashboard />} />

        {/* Later, you can easily add more routes here, like: */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </BrowserRouter>
  );
}