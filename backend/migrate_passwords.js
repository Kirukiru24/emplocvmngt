const pool = require("./src/config/db");
const bcrypt = require("bcryptjs");

async function migrate() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT id, password FROM employees");
        for (let row of res.rows) {
            // Check if it's already hashed (bcrypt hashes start with $2a$ or $2b$)
            if (!row.password.startsWith('$2')) {
                const hash = await bcrypt.hash(row.password, 10);
                await client.query("UPDATE employees SET password = $1 WHERE id = $2", [hash, row.id]);
                console.log(`Hashed password for ID: ${row.id}`);
            }
        }
        console.log("Migration complete!");
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();