import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminReferenceOrganizer from './App';
import UserReferenceOrganizer from './User';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminReferenceOrganizer />} />
        <Route path="/user" element={<UserReferenceOrganizer />} />
        <Route path="/" element={<UserReferenceOrganizer />} /> {/* par défaut */}
      </Routes>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);

export default App;
