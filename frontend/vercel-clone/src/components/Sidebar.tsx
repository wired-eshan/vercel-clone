// src/components/Sidebar.jsx
import { Link, useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    //logout logic here

    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-black text-white flex flex-col sticky top-0">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        ShipStack
      </div>
      <nav className="flex-1 p-4 space-y-4">
        <Link to="/" className="block hover:text-gray-300">Home</Link>
        <Link to="/projects" className="block hover:text-gray-300">Projects</Link>
        <Link to="/deployments" className="block hover:text-gray-300">Deployments</Link>

      </nav>
      <button
        onClick={handleLogout}
        className="p-4 border-t border-gray-700 hover:bg-gray-700 text-left"
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
