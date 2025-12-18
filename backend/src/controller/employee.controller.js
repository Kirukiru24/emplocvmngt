const pool = require("../config/db");
const path = require("path");
const bcrypt = require("bcryptjs"); // For hashing
const jwt = require("jsonwebtoken"); // For tokens

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
// Helper to sanitize paths for web (Windows \ to /)
const normalizePath = (filePath) => {
  return filePath ? filePath.split(path.sep).join('/') : null;
};

// --- NEW LOGIN FUNCTION ---
const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const userRes = await pool.query("SELECT * FROM employees WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const user = userRes.rows[0];

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" } // Token valid for 1 day
    );

    // 4. Send response (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};


const createEmployee = async (req, res) => {
  const client = await pool.connect();
  try {
    let {
      first_name, last_name, email, dob, nationality,
      proposed_position, firm_name, associations,
      work_countries, languages, education, trainings,
      employment_history, password,
    } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const parsedEdu = typeof education === "string" ? JSON.parse(education) : [];
    const parsedTrain = typeof trainings === "string" ? JSON.parse(trainings) : [];
    const parsedEmp = typeof employment_history === "string" ? JSON.parse(employment_history) : [];
    const picturePath = req.file ? normalizePath(req.file.path) : null;

    await client.query("BEGIN");

    // --- STEP 1: CHECK FOR EXISTING USER (LEGACY DATA) ---
    const existingUserRes = await client.query(
      "SELECT id, password FROM employees WHERE email = $1", 
      [email]
    );

    let employeeId;

    if (existingUserRes.rows.length > 0) {
      const existingUser = existingUserRes.rows[0];

      // If password does NOT start with $2 (bcrypt prefix), it's legacy data
      if (!existingUser.password.startsWith('$2')) {
        console.log("Legacy user detected. Updating account and password...");
        
        // Update existing record with the new hashed password and latest info
        await client.query(
          `UPDATE employees SET 
            first_name=$1, last_name=$2, password=$3, dob=$4, nationality=$5, 
            proposed_position=$6, firm_name=$7, picture=COALESCE($8, picture), 
            associations=$9, work_countries=$10, languages=$11 
          WHERE id=$12`,
          [
            first_name, last_name, hashedPassword, dob, nationality, 
            proposed_position, firm_name, picturePath, associations, 
            work_countries, languages, existingUser.id
          ]
        );
        employeeId = existingUser.id;

        // Clean up old sub-records before re-inserting (optional, avoids duplicates)
        await client.query("DELETE FROM education WHERE employee_id=$1", [employeeId]);
        await client.query("DELETE FROM trainings WHERE employee_id=$1", [employeeId]);
        await client.query("DELETE FROM employment_history WHERE employee_id=$1", [employeeId]);

      } else {
        // User already has a secure account
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "An account with this email already exists." });
      }
    } else {
      // --- STEP 2: TOTALLY NEW USER ---
      const employeeRes = await client.query(
        `INSERT INTO employees 
          (first_name, last_name, email, password, dob, nationality, proposed_position, firm_name, picture, associations, work_countries, languages) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [
          first_name, last_name, email, hashedPassword, dob, nationality, 
          proposed_position, firm_name, picturePath, associations, 
          work_countries, languages
        ]
      );
      employeeId = employeeRes.rows[0].id;
    }

    // --- STEP 3: INSERT SUB-TABLE DATA (EDUCATION, TRAININGS, EMPLOYMENT) ---
    for (let edu of parsedEdu) {
      if (edu.degree && edu.institution) {
        await client.query(
          `INSERT INTO education (employee_id, degree, institution, year_completed) VALUES ($1,$2,$3,$4)`,
          [employeeId, edu.degree, edu.institution, edu.year_completed]
        );
      }
    }

    for (let t of parsedTrain) {
      if (t.certification_name && t.certification_name.trim() !== "") {
        await client.query(
          `INSERT INTO trainings (employee_id, certification_name) VALUES ($1,$2)`,
          [employeeId, t.certification_name]
        );
      }
    }

    for (let job of parsedEmp) {
      if (job.employer) {
        await client.query(
          `INSERT INTO employment_history (employee_id, employer, position_held, start_date, end_date) VALUES ($1,$2,$3,$4,$5)`,
          [employeeId, job.employer, job.position_held, job.start_date, job.end_date]
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ 
      message: existingUserRes.rows.length > 0 ? "Account claimed successfully" : "Created successfully", 
      employee_id: employeeId 
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error in createEmployee:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Get all employees (Optimized with sub-queries or separate fetches)
const getAllEmployees = async (req, res) => {
  const client = await pool.connect();
  try {
    const employeesRes = await client.query("SELECT * FROM employees ORDER BY id DESC");
    const employees = employeesRes.rows;

    for (let emp of employees) {
      const [edu, train, work] = await Promise.all([
        client.query("SELECT * FROM education WHERE employee_id=$1", [emp.id]),
        client.query("SELECT * FROM trainings WHERE employee_id=$1", [emp.id]),
        client.query("SELECT * FROM employment_history WHERE employee_id=$1", [emp.id])
      ]);
      emp.education = edu.rows;
      emp.trainings = train.rows;
      emp.employment_history = work.rows;
    }

    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// --- UPDATE EMPLOYEE FUNCTION ---
const updateEmployee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    let {
      first_name, last_name, email, dob, nationality,
      proposed_position, firm_name, associations,
      work_countries, languages, education, trainings,
      employment_history
    } = req.body;

    // Parse nested data if they come as strings (from FormData)
    const parsedEdu = typeof education === "string" ? JSON.parse(education) : education || [];
    const parsedTrain = typeof trainings === "string" ? JSON.parse(trainings) : trainings || [];
    const parsedEmp = typeof employment_history === "string" ? JSON.parse(employment_history) : employment_history || [];
    const picturePath = req.file ? normalizePath(req.file.path) : null;

    await client.query("BEGIN");

    // 1. Update main employee details
    // We use COALESCE for the picture to keep the old one if a new one isn't uploaded
    await client.query(
      `UPDATE employees SET 
        first_name=$1, last_name=$2, email=$3, dob=$4, nationality=$5, 
        proposed_position=$6, firm_name=$7, picture=COALESCE($8, picture), 
        associations=$9, work_countries=$10, languages=$11 
      WHERE id=$12`,
      [
        first_name, last_name, email, dob, nationality, 
        proposed_position, firm_name, picturePath, associations, 
        work_countries, languages, id
      ]
    );

    // 2. Clean up old sub-records
    await client.query("DELETE FROM education WHERE employee_id=$1", [id]);
    await client.query("DELETE FROM trainings WHERE employee_id=$1", [id]);
    await client.query("DELETE FROM employment_history WHERE employee_id=$1", [id]);

    // 3. Re-insert Education
    for (let edu of parsedEdu) {
      if (edu.degree && edu.institution) {
        await client.query(
          `INSERT INTO education (employee_id, degree, institution, year_completed) VALUES ($1,$2,$3,$4)`,
          [id, edu.degree, edu.institution, edu.year_completed]
        );
      }
    }

    // 4. Re-insert Trainings
    for (let t of parsedTrain) {
      if (t.certification_name && t.certification_name.trim() !== "") {
        await client.query(
          `INSERT INTO trainings (employee_id, certification_name) VALUES ($1,$2)`,
          [id, t.certification_name]
        );
      }
    }

    // 5. Re-insert Employment History
    for (let job of parsedEmp) {
      if (job.employer) {
        await client.query(
          `INSERT INTO employment_history (employee_id, employer, position_held, start_date, end_date) VALUES ($1,$2,$3,$4,$5)`,
          [id, job.employer, job.position_held, job.start_date, job.end_date]
        );
      }
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Profile updated successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


const changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    // 1. Fetch user
    const userRes = await pool.query("SELECT password FROM employees WHERE id = $1", [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = userRes.rows[0];

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password incorrect" });

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update DB
    await pool.query("UPDATE employees SET password = $1 WHERE id = $2", [hashedPassword, id]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


// Get employee by ID
const getEmployeeById = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const empRes = await client.query("SELECT * FROM employees WHERE id=$1", [id]);
    
    if (empRes.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const emp = empRes.rows[0];

    const [edu, train, work] = await Promise.all([
      client.query("SELECT * FROM education WHERE employee_id=$1", [id]),
      client.query("SELECT * FROM trainings WHERE employee_id=$1", [id]),
      client.query("SELECT * FROM employment_history WHERE employee_id=$1", [id])
    ]);

    emp.education = edu.rows;
    emp.trainings = train.rows;
    emp.employment_history = work.rows;

    res.status(200).json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    // Note: Due to Foreign Key constraints, ensure child rows are deleted via ON DELETE CASCADE in SQL
    // or manually delete them here.
    await client.query("DELETE FROM employees WHERE id=$1", [id]);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  deleteEmployee,
  loginEmployee,
  updateEmployee,
  changePassword,
};