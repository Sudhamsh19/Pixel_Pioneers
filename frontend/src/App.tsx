import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CommandCenter from './pages/CommandCenter';
import AutomationStatus from './pages/AutomationStatus';
import ThreatMap from './pages/ThreatMap';
import EventStream from './pages/EventStream';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/automation" element={<AutomationStatus />} />
          <Route path="/map" element={<ThreatMap />} />
          <Route path="/events" element={<EventStream />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
