import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PerformanceReviewTool from './components/PerformanceReviewTool';
import RolePage from './pages/RolePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PerformanceReviewTool />} />
        <Route path="/performance-review-generator/:role" element={<RolePage />} />
      </Routes>
    </BrowserRouter>
  );
}