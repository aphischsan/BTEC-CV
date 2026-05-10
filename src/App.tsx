import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CVBuilder from './pages/CVBuilder';
import TeacherDashboard from './pages/TeacherDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CVBuilder />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
