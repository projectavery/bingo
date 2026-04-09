import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LotteryPage from './pages/Lottery';
import QueryPage from './pages/Query';
import RedeemPage from './pages/Redeem';

function App() {
  return (
    <Router>
      <div className="container">
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/query" />} />
            <Route path="/lottery" element={<LotteryPage />} />
            <Route path="/query" element={<QueryPage />} />
            <Route path="/redeem" element={<RedeemPage />} />
          </Routes>
        </main>

        <footer style={{ marginTop: '50px', textAlign: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '0.7rem' }}>
          &copy; 2026 TechBingo System.
        </footer>
      </div>
    </Router>
  );
}

export default App;
