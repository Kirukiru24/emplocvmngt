const express = require("express");
const router = express.Router();
const controller = require("../controller/employee.controller");
const upload = require("../config/multer");

// --- ADD THIS LINE BELOW ---
// This maps POST /api/employees to your createEmployee function
router.post("/", upload.single("picture"), controller.createEmployee);

router.post("/login", controller.loginEmployee);
router.put("/:id", upload.single("picture"), controller.updateEmployee);
router.get("/", controller.getAllEmployees);
router.get("/:id", controller.getEmployeeById);
router.delete("/:id", controller.deleteEmployee);
router.put("/:id/change-password", controller.changePassword);

module.exports = router;