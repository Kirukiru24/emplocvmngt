const express = require("express");
const cors = require("cors");
const path = require('path');

const employeeRoutes = require("./routes/employee.routes");

const app = express();




app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/employees", employeeRoutes);

module.exports = app;
