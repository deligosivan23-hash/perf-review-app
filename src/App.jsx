import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PerformanceReviewTool from './components/PerformanceReviewTool';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PerformanceReviewTool />} />
      </Routes>
    </BrowserRouter>
  );
}