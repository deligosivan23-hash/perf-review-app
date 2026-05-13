import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PerformanceReviewTool from './components/PerformanceReviewTool';
import RolePage from './pages/RolePage';
import PrivacyPolicy from './pages/PrivacyPolicy';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PerformanceReviewTool />} />
        <Route path="/performance-review-generator/:role" element={<RolePage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}