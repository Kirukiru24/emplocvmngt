const app = require("./app");

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://172.17.50.135:${PORT}`);
});
