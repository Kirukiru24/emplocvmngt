import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../services/api";

export default function EmployeeCV() {
  const { id } = useParams();
  const cvRef = useRef();
  const [employee, setEmployee] = useState(null);
  const baseUrl = import.meta.env.VITE_API_URL;
  console.log("Base URL:", baseUrl);
  useEffect(() => {
    api.get(`/employees/${id}`).then((res) => {
      setEmployee(res.data);
    });
  }, [id]);
  console.log("Employee Image Path:", employee?.picture);

  const exportPDF = () => {
    const element = cvRef.current;
    const opt = {
      margin: 0,
      filename: `${employee.first_name}_${employee.last_name}_CV.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  if (!employee) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto my-2 shadow-lg border">
      <div className="flex justify-end p-4 bg-gray-100 border-b">
        <button
          onClick={exportPDF}
          className="bg-blue-700 text-white px-6 py-2 rounded shadow hover:bg-blue-800 transition"
        >
          Export to PDF
        </button>
      </div>

      <div 
        ref={cvRef} 
        style={{ 
          width: "794px", 
          backgroundColor: "#ffffff", 
          color: "#000000",
          fontFamily: "Arial, sans-serif",
          margin: "0 auto",
          paddingBottom: "60px"
        }}
      >
        {/* HEADER */}
        <div style={{ backgroundColor: "#0000CD", padding: "40px", display: "flex", gap: "30px", alignItems: "center", color: "#ffffff" }}>
          {employee.picture && (
            <img
              src={`${baseUrl}/${employee.picture}`}
              alt="Employee"
              style={{ width: "150px", height: "180px", objectFit: "cover", border: "3px solid #ffffff", borderRadius: "4px" }}
            />
          )}
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 5px 0", textTransform: "uppercase" }}>
              {employee.first_name} {employee.last_name}
            </h1>
            <p style={{ fontSize: "18px", opacity: "0.9", margin: "0" }}>{employee.email}</p>
          </div>
        </div>

        {/* BODY CONTENT - Strict Order */}
        <div style={{ padding: "40px" }}>
          
          <div className="cv-row">
            <span className="cv-number">1. Proposed Position:</span>
            <span className="cv-value" style={{ fontWeight: "bold" }}>{employee.proposed_position}</span>
          </div>

          <div className="cv-row">
            <span className="cv-number">2. Name of Firm:</span>
            <span className="cv-value">{employee.firm_name}</span>
          </div>

          <div className="cv-row">
            <span className="cv-number">3. Name of Staff:</span>
            <span className="cv-value">{employee.first_name} {employee.last_name}</span>
          </div>

          <div className="cv-row">
            <span className="cv-number">4. Date of Birth:</span>
            <span className="cv-value">{employee.dob}</span>
          </div>

          <div className="cv-row">
            <span className="cv-number">5. Nationality:</span>
            <span className="cv-value">{employee.nationality}</span>
          </div>

          <div className="cv-row">
            <span className="cv-number">6. Education:</span>
            <div className="cv-value">
              {employee.education?.map((edu, i) => (
                <p key={i} style={{ margin: "0 0 8px 0" }}>
                  <strong>{edu.degree}</strong>, {edu.institution}, {edu.year_completed}
                </p>
              ))}
            </div>
          </div>

          <div className="cv-row">
            <span className="cv-number">7. Membership of Professional Associations:</span>
            <span className="cv-value">{employee.associations || "N/A"}</span>
          </div>

          <div className="cv-row">
            <span className="cv-number">8. Other Trainings:</span>
            <div className="cv-value">
              {employee.trainings?.map((t, i) => (
                <p key={i} style={{ margin: "0 0 5px 0" }}>• {t.certification_name}</p>
              ))}
              {(!employee.trainings || employee.trainings.length === 0) && "N/A"}
            </div>
          </div>

          <div className="cv-row">
            <span className="cv-number">9. Countries of Work Experience:</span>
            <span className="cv-value">{employee.work_countries || "N/A"}</span>
          </div>

          <div className="cv-row">
            <span className="cv-number">10. Languages:</span>
            <span className="cv-value">{employee.languages || "N/A"}</span>
          </div>

          <div className="cv-row" style={{ marginTop: "10px" }}>
            <span className="cv-number">11. Employment Record:</span>
            <div className="cv-value">
              {employee.employment_history?.map((job, i) => (
                <div key={i} style={{ 
                  marginBottom: "15px", 
                  borderLeft: "2px solid #0000CD", 
                  paddingLeft: "15px",
                  paddingTop: "2px" 
                }}>
                  <p style={{ margin: "0", fontSize: "13px", color: "#444" }}>
                    <strong>{job.start_date} – {job.end_date}</strong>
                  </p>
                  <p style={{ margin: "3px 0" }}><strong>Employer:</strong> {job.employer}</p>
                  <p style={{ margin: "0" }}><strong>Position Held:</strong> {job.position_held}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .cv-row {
          display: grid !important;
          grid-template-columns: 240px 1fr !important;
          gap: 15px !important;
          margin-bottom: 18px;
          align-items: baseline;
          line-height: 1.4;
        }
        .cv-number {
          font-weight: bold;
          font-size: 13px;
          color: #000000;
        }
        .cv-value {
          font-size: 13px;
          color: #000000;
        }
        @media print {
          .no-print { display: none; }
        }
      `}</style>
    </div>
  );
}