// src/layouts/AppLayout.jsx
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <Sidebar />
      {/* Main content on the right */}
      <main className="flex-1 p-6 text-white bg-gradient-to-bl to-transparent from-black">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
