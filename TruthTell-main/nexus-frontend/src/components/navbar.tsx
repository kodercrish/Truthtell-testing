import { Link } from "react-router-dom";
import logo from "@/images/logo.png"

export default function Navbar() {
  return (
    <nav className="absolute top-4 left-4 z-50">
      <div className="bg-slate-800/70 backdrop-blur-sm p-3 rounded-xl shadow-lg flex items-center gap-4">
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="TruthTell Logo" 
            className="h-8 w-8 rounded-full"
          />
          <span className="ml-2 text-sm font-bold text-white">TruthTell</span>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/" 
            className="px-3 py-1 text-sm text-white rounded-lg hover:bg-slate-700/70 transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/dashboard"
            className="px-3 py-1 text-sm text-white rounded-lg hover:bg-slate-700/70 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
