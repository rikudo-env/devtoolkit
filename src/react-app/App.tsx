import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import GeneratorsPage from "@/react-app/pages/Generators";
import TimestampsPage from "@/react-app/pages/Timestamps";
import SecurityPage from "@/react-app/pages/Security";
import NetworkPage from "@/react-app/pages/Network";
import ConvertersPage from "@/react-app/pages/Converters";
import DevOpsPage from "@/react-app/pages/DevOps";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/generators" replace />} />
          <Route path="/generators" element={<GeneratorsPage />} />
          <Route path="/timestamps" element={<TimestampsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/converters" element={<ConvertersPage />} />
          <Route path="/devops" element={<DevOpsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
