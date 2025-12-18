import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
// Added LogOut icon
import { Eye, Search, UserRound, UserCircle, Plus, LogOut } from "lucide-react";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL;

  // Get logged-in user info to check if they are privileged
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPosition = userData?.proposed_position?.toLowerCase() || "";
  const isPrivileged = 
    userPosition.includes("ict solution manager") || 
    userPosition.includes("division head") ||
    userPosition.includes("general manager") ||
    userPosition.includes("director");

  useEffect(() => {
    api
      .get("/employees")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Error fetching employees:", err))
      .finally(() => setLoading(false));
  }, []);

  // Logout Function
  const handleLogout = () => {
    localStorage.clear(); // Clears user session
    navigate("/login");    // Redirects to login page
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.proposed_position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 font-medium">
        <div className="animate-pulse">Loading directory...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Employee Directory</h2>
          <p className="text-gray-500 text-sm">Manage and view professional CVs</p>
        </div>

        {/* --- NAVIGATION ACTIONS --- */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. BUTTON TO GO TO OWN PROFILE */}
          <button 
            onClick={() => navigate("/my-profile")}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-all shadow-md font-bold text-sm"
          >
            <UserCircle size={20} />
            My Personal CV
          </button>

          {/* 2. BUTTON TO REGISTER NEW STAFF (Only if Privileged) */}
          {isPrivileged && (
            <button 
              onClick={() => navigate("/employees/new")}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-bold text-sm"
            >
              <Plus size={20} />
              Register Staff
            </button>
          )}

          {/* 3. LOGOUT BUTTON */}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2.5 text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all shadow-sm font-bold text-sm"
            title="Logout"
          >
            <LogOut size={20} />
            <span className="hidden md:inline ml-2">Logout</span>
          </button>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="mb-8 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by position (e.g. Manager)"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Statistics Tab */}
      <div className="mb-6 flex gap-4">
        <div className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
          Total: {employees.length}
        </div>
        {searchTerm && (
          <div className="bg-green-50 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
            Found: {filteredEmployees.length}
          </div>
        )}
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <UserRound className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No employees matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden ring-2 ring-blue-50">
                  {emp.picture ? (
                    <img
                      src={`${baseUrl}/${emp.picture}`}
                      alt="Employee"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${emp.first_name}&background=random`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <UserRound size={32} />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">
                    {emp.first_name} {emp.last_name}
                  </h3>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    {emp.proposed_position || "No Position Defined"}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2 mb-6 bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="truncate ml-2">{emp.email || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nationality:</span>
                  <span>{emp.nationality}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/employees/${emp.id}/cv`)}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                <Eye size={18} />
                View Full CV
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}