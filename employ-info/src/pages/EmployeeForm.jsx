import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Trash2, Plus, User, Globe, Award, Languages, Lock } from "lucide-react";

/* ------------------ Initial States ------------------ */
const initialEducation = { degree: "", institution: "", year_completed: "" };
const initialTraining = { certification_name: "" };
const initialEmployment = {
  employer: "",
  position_held: "",
  start_date: "",
  end_date: "",
};

export default function EmployeeForm() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "", // Added to resolve "Password is required" error
    dob: "",
    nationality: "Ethiopian",
    proposed_position: "",
    firm_name: "ALTA Computec PLC",
    associations: "",
    work_countries: "",
    languages: "",
    picture: null,
    education: [initialEducation],
    trainings: [initialTraining],
    employment_history: [initialEmployment],
  });

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  /* ------------------ Handlers ------------------ */

  const handleBasicChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleNestedChange = (e, index, section) => {
    const { name, value } = e.target;
    setEmployee((prev) => {
      const list = [...prev[section]];
      list[index] = { ...list[index], [name]: value };
      return { ...prev, [section]: list };
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEmployee({ ...employee, picture: e.target.files[0] });
    }
  };

  const addItem = (section, initialItem) => {
    setEmployee((prev) => ({
      ...prev,
      [section]: [...prev[section], initialItem],
    }));
  };

  const removeItem = (section, index) => {
    setEmployee((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  /* ------------------ Submit ------------------ */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const formData = new FormData();

      // Basic fields including password
      const basicFields = [
        "first_name", "last_name", "email", "password", 
        "dob", "nationality", "proposed_position", "firm_name", 
        "associations", "work_countries", "languages"
      ];
      
      basicFields.forEach(field => {
        formData.append(field, employee[field] || "");
      });

      // Filter out empty rows to prevent DB Null constraints
      const cleanEducation = employee.education.filter(edu => edu.degree.trim() !== "");
      const cleanTrainings = employee.trainings.filter(t => t.certification_name.trim() !== "");
      const cleanHistory = employee.employment_history.filter(job => job.employer.trim() !== "");

      formData.append("education", JSON.stringify(cleanEducation));
      formData.append("trainings", JSON.stringify(cleanTrainings));
      formData.append("employment_history", JSON.stringify(cleanHistory));

      if (employee.picture) {
        formData.append("picture", employee.picture);
      }

      // Ensure your api instance uses baseURL: "http://172.17.50.135:5000/api"
      const res = await api.post("/employees", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitStatus("success");
      setTimeout(() => navigate(`/employees/${res.data.employee_id}/cv`), 1500);
    } catch (err) {
      console.error("Submission Error:", err.response?.data || err.message);
      setSubmitStatus("error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI Components ------------------ */

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 border-b pb-2 text-blue-700">
      <Icon size={20} />
      <h3 className="font-bold uppercase text-sm tracking-wider">{title}</h3>
    </div>
  );

  const RemoveButton = ({ onClick }) => (
    <button type="button" onClick={onClick} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
      <Trash2 size={18} />
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-2xl rounded-xl my-10 border border-gray-100 font-sans">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Employee Profile</h2>
        <p className="text-gray-500">Create account and generate professional CV</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* 1. Account & Personal Info */}
        <div className="flex flex-col md:flex-row gap-8 items-start bg-gray-50 p-6 rounded-lg">
          <div className="relative group">
            <div className="w-32 h-40 rounded-lg bg-gray-200 overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center">
              {employee.picture ? (
                <img src={URL.createObjectURL(employee.picture)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            <div className="text-xs text-center mt-2 text-blue-600 font-medium">Upload Photo</div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <input name="first_name" placeholder="First Name" value={employee.first_name} onChange={handleBasicChange} className="input" required />
            <input name="last_name" placeholder="Last Name" value={employee.last_name} onChange={handleBasicChange} className="input" required />
            <input name="email" type="email" placeholder="Email (Login ID)" value={employee.email} onChange={handleBasicChange} className="input" required />
            
            {/* Password Input - Fixes the 400 Error */}
            <div className="relative">
              <input 
                name="password" 
                type="password" 
                placeholder="Set Account Password" 
                value={employee.password} 
                onChange={handleBasicChange} 
                className="input border-blue-200" 
                required 
              />
              <Lock size={16} className="absolute right-3 top-3.5 text-gray-400" />
            </div>

            <input type="date" name="dob" value={employee.dob} onChange={handleBasicChange} className="input" />
            <input name="nationality" placeholder="Nationality" value={employee.nationality} onChange={handleBasicChange} className="input" />
          </div>
        </div>

        {/* 2. Professional Details */}
        <section>
          <SectionHeader icon={Award} title="Professional Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="proposed_position" placeholder="Proposed Position" value={employee.proposed_position} onChange={handleBasicChange} className="input" />
            <input name="firm_name" value={employee.firm_name} className="input bg-gray-100 cursor-not-allowed" disabled />
            <textarea name="associations" placeholder="Membership of Professional Associations" value={employee.associations} onChange={handleBasicChange} className="input col-span-full h-20" />
          </div>
        </section>

        {/* 3. Global & Languages */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <SectionHeader icon={Globe} title="Regional Experience" />
            <input name="work_countries" placeholder="Countries of Work Experience" value={employee.work_countries} onChange={handleBasicChange} className="input" />
          </div>
          <div>
            <SectionHeader icon={Languages} title="Languages" />
            <input name="languages" placeholder="Languages (e.g. Amharic, English)" value={employee.languages} onChange={handleBasicChange} className="input" />
          </div>
        </section>

        {/* 4. Education */}
        <section>
          <SectionHeader icon={Plus} title="Education" />
          {employee.education.map((edu, i) => (
            <div key={i} className="flex gap-2 mb-3">
              <input name="degree" placeholder="Degree" value={edu.degree} onChange={(e) => handleNestedChange(e, i, "education")} className="input flex-[2]" />
              <input name="institution" placeholder="Institution" value={edu.institution} onChange={(e) => handleNestedChange(e, i, "education")} className="input flex-[2]" />
              <input name="year_completed" placeholder="Year" value={edu.year_completed} onChange={(e) => handleNestedChange(e, i, "education")} className="input flex-1" />
              {employee.education.length > 1 && <RemoveButton onClick={() => removeItem("education", i)} />}
            </div>
          ))}
          <button type="button" onClick={() => addItem("education", initialEducation)} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
            <Plus size={16} /> Add Education
          </button>
        </section>

        {/* 5. Trainings */}
        <section>
          <SectionHeader icon={Plus} title="Certifications & Trainings" />
          {employee.trainings.map((t, i) => (
            <div key={i} className="flex gap-2 mb-3">
              <input name="certification_name" placeholder="Certification Name" value={t.certification_name} onChange={(e) => handleNestedChange(e, i, "trainings")} className="input flex-1" />
              {employee.trainings.length > 1 && <RemoveButton onClick={() => removeItem("trainings", i)} />}
            </div>
          ))}
          <button type="button" onClick={() => addItem("trainings", initialTraining)} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
            <Plus size={16} /> Add Training
          </button>
        </section>

        {/* 6. Employment History */}
        <section>
          <SectionHeader icon={Plus} title="Employment History" />
          {employee.employment_history.map((job, i) => (
            <div key={i} className="bg-white border rounded-lg p-4 mb-4 relative shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <input name="employer" placeholder="Employer" value={job.employer} onChange={(e) => handleNestedChange(e, i, "employment_history")} className="input" />
                <input name="position_held" placeholder="Position" value={job.position_held} onChange={(e) => handleNestedChange(e, i, "employment_history")} className="input" />
                <div className="flex flex-col">
                   <label className="text-[10px] uppercase text-gray-400 px-1 font-bold">From</label>
                   <input type="date" name="start_date" value={job.start_date} onChange={(e) => handleNestedChange(e, i, "employment_history")} className="input" />
                </div>
                <div className="flex flex-col">
                   <label className="text-[10px] uppercase text-gray-400 px-1 font-bold">To</label>
                   <input type="date" name="end_date" value={job.end_date} onChange={(e) => handleNestedChange(e, i, "employment_history")} className="input" />
                </div>
              </div>
              {employee.employment_history.length > 1 && (
                <div className="absolute -right-2 -top-2">
                  <RemoveButton onClick={() => removeItem("employment_history", i)} />
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addItem("employment_history", initialEmployment)} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
            <Plus size={16} /> Add Employment
          </button>
        </section>

        {/* Submit */}
        <div className="pt-8 border-t flex flex-col items-center">
          <button
            type="submit"
            disabled={loading}
            className={`w-full md:w-64 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 active:scale-95"}`}
          >
            {loading ? "Processing..." : "Save Employee Profile"}
          </button>

          {submitStatus === "success" && <p className="text-green-600 mt-4 font-medium animate-pulse">Profile Created Successfully!</p>}
          {submitStatus === "error" && <p className="text-red-600 mt-4 font-medium">Submission Failed. Check console for details.</p>}
        </div>
      </form>

      <style jsx global>{`
        .input {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          border-radius: 0.5rem;
          width: 100%;
          transition: all 0.2s;
          font-size: 0.95rem;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}