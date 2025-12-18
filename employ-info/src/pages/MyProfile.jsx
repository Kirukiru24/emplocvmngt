import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../services/api";
import { LogOut, Edit3, Save, X, Plus, Trash2, ShieldCheck, Users } from "lucide-react";

export default function MyProfile() {
  const cvRef = useRef();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [pwModal, setPwModal] = useState(false);
  const [pwData, setPwData] = useState({ oldPassword: "", newPassword: "" });

  const userData = JSON.parse(localStorage.getItem("user"));
  const userPosition = userData?.proposed_position?.toLowerCase() || "";
  const isPrivileged = 
    userPosition.includes("ict solution manager") || 
    userPosition.includes("division head") ||
    userPosition.includes("general manager") ||
    userPosition.includes("director");

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const fetchProfile = () => {
    if (!userData || !userData.id) return navigate("/login");
    api.get(`/employees/${userData.id}`).then((res) => {
      setEmployee(res.data);
    }).catch(() => navigate("/login"));
  };

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleListChange = (index, field, value, listName) => {
    const newList = [...employee[listName]];
    newList[index][field] = value;
    setEmployee({ ...employee, [listName]: newList });
  };

  const addItem = (listName, template) => {
    setEmployee({ ...employee, [listName]: [...(employee[listName] || []), template] });
  };

  const removeItem = (index, listName) => {
    const newList = employee[listName].filter((_, i) => i !== index);
    setEmployee({ ...employee, [listName]: newList });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      const fields = ['first_name', 'last_name', 'email', 'dob', 'nationality', 'proposed_position', 'firm_name', 'associations', 'work_countries', 'languages'];
      fields.forEach(f => data.append(f, employee[f] || ''));
      data.append('education', JSON.stringify(employee.education || []));
      data.append('trainings', JSON.stringify(employee.trainings || []));
      data.append('employment_history', JSON.stringify(employee.employment_history || []));

      await api.put(`/employees/${employee.id}`, data);
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      alert("Error updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // PDF Export - Configured for Tailwind v4 compatibility
  const exportPDF = () => {
    const element = cvRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `CV_${employee.first_name}_${employee.last_name}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794
      },
      jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${employee.id}/change-password`, pwData);
      alert("Password updated successfully!");
      setPwModal(false);
      setPwData({ oldPassword: "", newPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  if (!employee) return <div className="flex items-center justify-center min-h-screen">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* NAV BAR (Uses Tailwind OKLCH safely because it's not in the PDF ref) */}
      <div className="max-w-4xl mx-auto flex justify-between items-center p-4 bg-white shadow-sm mb-4 sticky top-0 z-50 border-b">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-slate-700">My Profile</h2>
          {isPrivileged && !isEditing && (
            <button onClick={() => navigate("/employees")} className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-bold text-sm bg-sky-50 px-3 py-1.5 rounded-full transition">
              <Users size={16} /> All Employees
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button onClick={() => setPwModal(true)} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded text-sm font-bold hover:bg-slate-200">
                <ShieldCheck size={16} /> Security
              </button>
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm font-bold">
                <Edit3 size={16} /> Edit CV
              </button>
              <button onClick={exportPDF} className="bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-blue-800">
                Export PDF
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm font-bold">
                <Save size={16} /> {loading ? "Saving..." : "Save"}
              </button>
              <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="flex items-center gap-2 bg-gray-200 text-slate-700 px-4 py-2 rounded text-sm font-bold">
                <X size={16} /> Cancel
              </button>
            </>
          )}
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50"><LogOut size={16} /></button>
        </div>
      </div>

      {/* CV CONTAINER - Using Hex colors for PDF Engine compatibility */}
      <div className="max-w-4xl mx-auto shadow-2xl" style={{ backgroundColor: "#ffffff" }}>
        <div ref={cvRef} id="cv-content" style={{ width: "794px", minHeight: "1123px", backgroundColor: "#ffffff", color: "#000000", fontFamily: "Arial", margin: "0 auto", paddingBottom: "60px" }}>
          
          {/* HEADER */}
          <div style={{ backgroundColor: "#0000CD", padding: "40px", display: "flex", gap: "30px", alignItems: "center", color: "#ffffff" }}>
            {employee.picture && <img src={`${baseUrl}/${employee.picture}`} alt="Profile" style={{ width: "150px", height: "180px", objectFit: "cover", border: "3px solid #ffffff" }} />}
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input name="first_name" value={employee.first_name} onChange={handleChange} style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "24px", fontWeight: "bold", textTransform: "uppercase", width: "100%", padding: "4px", border: "1px solid rgba(255,255,255,0.3)" }} placeholder="First Name" />
                  <input name="last_name" value={employee.last_name} onChange={handleChange} style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "24px", fontWeight: "bold", textTransform: "uppercase", width: "100%", padding: "4px", border: "1px solid rgba(255,255,255,0.3)" }} placeholder="Last Name" />
                  <input name="email" value={employee.email} onChange={handleChange} style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "18px", width: "100%", padding: "4px", border: "1px solid rgba(255,255,255,0.3)" }} placeholder="Email" />
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: "30px", fontWeight: "bold", textTransform: "uppercase", margin: 0 }}>{employee.first_name} {employee.last_name}</h1>
                  <p style={{ fontSize: "18px", opacity: 0.9, margin: 0 }}>{employee.email}</p>
                </>
              )}
            </div>
          </div>

          <div style={{ padding: "40px" }}>
            <div className="cv-row">
              <span className="cv-label">1. Proposed Position:</span>
              {isEditing ? <input name="proposed_position" value={employee.proposed_position} onChange={handleChange} className="cv-input" /> : <span className="cv-text" style={{ fontWeight: "bold" }}>{employee.proposed_position}</span>}
            </div>

            <div className="cv-row">
              <span className="cv-label">2. Name of Firm:</span>
              {isEditing ? <input name="firm_name" value={employee.firm_name} onChange={handleChange} className="cv-input" /> : <span className="cv-text">{employee.firm_name}</span>}
            </div>

            <div className="cv-row">
              <span className="cv-label">3. Name of Staff:</span>
              <span className="cv-text">{employee.first_name} {employee.last_name}</span>
            </div>

            <div className="cv-row">
              <span className="cv-label">4. Date of Birth:</span>
              {isEditing ? <input type="date" name="dob" value={employee.dob} onChange={handleChange} className="cv-input" /> : <span className="cv-text">{employee.dob}</span>}
            </div>

            <div className="cv-row">
              <span className="cv-label">5. Nationality:</span>
              {isEditing ? <input name="nationality" value={employee.nationality} onChange={handleChange} className="cv-input" /> : <span className="cv-text">{employee.nationality}</span>}
            </div>

            <div className="cv-row">
              <span className="cv-label">6. Education:</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {employee.education?.map((edu, i) => (
                  <div key={i}>
                    {isEditing ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px auto", gap: "8px", backgroundColor: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }}>
                        <input placeholder="Degree" value={edu.degree} onChange={(e) => handleListChange(i, 'degree', e.target.value, 'education')} style={{ fontSize: "12px", padding: "2px" }} />
                        <input placeholder="Institution" value={edu.institution} onChange={(e) => handleListChange(i, 'institution', e.target.value, 'education')} style={{ fontSize: "12px", padding: "2px" }} />
                        <input placeholder="Year" value={edu.year_completed} onChange={(e) => handleListChange(i, 'year_completed', e.target.value, 'education')} style={{ fontSize: "12px", padding: "2px" }} />
                        <button onClick={() => removeItem(i, 'education')} style={{ color: "#ef4444" }}><Trash2 size={14}/></button>
                      </div>
                    ) : (
                      <p className="cv-text" style={{ margin: 0 }}><strong>{edu.degree}</strong>, {edu.institution}, {edu.year_completed}</p>
                    )}
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('education', {degree:'', institution:'', year_completed:''})} style={{ color: "#2563eb", fontSize: "12px", fontWeight: "bold", textAlign: "left" }}>+ ADD EDUCATION</button>}
              </div>
            </div>

            <div className="cv-row">
              <span className="cv-label">7. Membership of Professional Associations:</span>
              {isEditing ? <textarea name="associations" value={employee.associations} onChange={handleChange} className="cv-input" style={{ height: "60px" }} /> : <span className="cv-text">{employee.associations || "N/A"}</span>}
            </div>

            <div className="cv-row">
              <span className="cv-label">8. Other Trainings:</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {employee.trainings?.map((t, i) => (
                  <div key={i}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "8px", backgroundColor: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }}>
                        <input placeholder="Certification" value={t.certification_name} onChange={(e) => handleListChange(i, 'certification_name', e.target.value, 'trainings')} style={{ flex: 1, fontSize: "12px" }} />
                        <button onClick={() => removeItem(i, 'trainings')} style={{ color: "#ef4444" }}><Trash2 size={14}/></button>
                      </div>
                    ) : (
                      <p className="cv-text" style={{ margin: 0 }}>• {t.certification_name}</p>
                    )}
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('trainings', {certification_name:''})} style={{ color: "#2563eb", fontSize: "12px", fontWeight: "bold", textAlign: "left" }}>+ ADD TRAINING</button>}
              </div>
            </div>

            <div className="cv-row">
              <span className="cv-label">9. Countries of Work Experience:</span>
              {isEditing ? <input name="work_countries" value={employee.work_countries} onChange={handleChange} className="cv-input" /> : <span className="cv-text">{employee.work_countries || "N/A"}</span>}
            </div>

            <div className="cv-row">
              <span className="cv-label">10. Languages:</span>
              {isEditing ? <input name="languages" value={employee.languages} onChange={handleChange} className="cv-input" /> : <span className="cv-text">{employee.languages || "N/A"}</span>}
            </div>

            <div className="cv-row">
              <span className="cv-label">11. Employment Record:</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {employee.employment_history?.map((job, i) => (
                  <div key={i} style={{ paddingLeft: "15px", borderLeft: "2px solid #0000CD", backgroundColor: isEditing ? "#f8fafc" : "transparent", padding: isEditing ? "10px" : "0 0 0 15px" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <input placeholder="Start" value={job.start_date} onChange={(e) => handleListChange(i, 'start_date', e.target.value, 'employment_history')} style={{ fontSize: "12px", width: "100%" }} />
                          <input placeholder="End" value={job.end_date} onChange={(e) => handleListChange(i, 'end_date', e.target.value, 'employment_history')} style={{ fontSize: "12px", width: "100%" }} />
                        </div>
                        <input placeholder="Employer" value={job.employer} onChange={(e) => handleListChange(i, 'employer', e.target.value, 'employment_history')} style={{ fontSize: "12px" }} />
                        <input placeholder="Position" value={job.position_held} onChange={(e) => handleListChange(i, 'position_held', e.target.value, 'employment_history')} style={{ fontSize: "12px" }} />
                        <button onClick={() => removeItem(i, 'employment_history')} style={{ color: "#ef4444", fontSize: "11px", textAlign: "left" }}>Remove Record</button>
                      </div>
                    ) : (
                      <>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>{job.start_date} – {job.end_date}</p>
                        <p className="cv-text" style={{ margin: "2px 0" }}><strong>Employer:</strong> {job.employer}</p>
                        <p className="cv-text" style={{ margin: 0 }}><strong>Position:</strong> {job.position_held}</p>
                      </>
                    )}
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('employment_history', {employer:'', position_held:'', start_date:'', end_date:''})} style={{ color: "#2563eb", fontSize: "12px", fontWeight: "bold", textAlign: "left" }}>+ ADD EMPLOYMENT RECORD</button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PW MODAL */}
      {pwModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
            <h3 className="font-bold mb-4">Update Password</h3>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
              <input type="password" placeholder="Current Password" required className="border p-2 rounded text-sm" onChange={(e) => setPwData({...pwData, oldPassword: e.target.value})} />
              <input type="password" placeholder="New Password" required className="border p-2 rounded text-sm" onChange={(e) => setPwData({...pwData, newPassword: e.target.value})} />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-bold">Save</button>
                <button type="button" onClick={() => setPwModal(false)} className="flex-1 bg-gray-100 py-2 rounded text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .cv-row { 
          display: grid; 
          grid-template-columns: 220px 1fr; 
          gap: 20px; 
          margin-bottom: 18px; 
          align-items: baseline; 
        }
        .cv-label { font-weight: bold; font-size: 13px; color: #000000; }
        .cv-text { font-size: 13px; color: #000000; line-height: 1.4; }
        .cv-input { 
          width: 100%; 
          border: 1px solid #cbd5e1; 
          padding: 4px 8px; 
          font-size: 13px; 
          border-radius: 4px; 
          background-color: #ffffff;
          color: #000000;
        }
      `}</style>
    </div>
  );
}