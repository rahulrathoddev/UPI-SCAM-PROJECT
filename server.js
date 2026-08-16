const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use("/uploads", express.static("uploads"));
const PORT = 3000;

let db;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(
    session({
        secret: "upi-fraud-demo-secret-change-this",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use(express.static(path.join(__dirname, "public")));


// ==========================================
// UPLOAD CONFIGURATION
// ==========================================

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, PNG, WEBP and PDF files are allowed"
                )
            );
        }
    }

});


// ==========================================
// DATABASE
// ==========================================

async function connectDatabase() {

    db = await open({
        filename: "./fraud.db",
        driver: sqlite3.Database
    });


    // Users table

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT UNIQUE NOT NULL,

            password TEXT NOT NULL,

            role TEXT DEFAULT 'user',

            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);


    // Reports table

    await db.exec(`
        CREATE TABLE IF NOT EXISTS reports (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            reporter_name TEXT NOT NULL,

            contact TEXT NOT NULL,

            incident_date TEXT NOT NULL,

            transaction_id TEXT,

            amount REAL NOT NULL,

            incident_type TEXT NOT NULL,

            description TEXT NOT NULL,

            additional_info TEXT,

            status TEXT DEFAULT 'New',

            created_at TEXT DEFAULT CURRENT_TIMESTAMP,

            user_id INTEGER,

            evidence_path TEXT,

            evidence_name TEXT
        )
    `);


    // Add columns to an older database if necessary

    const columns =
        await db.all(
            "PRAGMA table_info(reports)"
        );

    const columnNames =
        columns.map(column => column.name);


    if (!columnNames.includes("user_id")) {

        await db.exec(
            "ALTER TABLE reports ADD COLUMN user_id INTEGER"
        );

    }


    if (!columnNames.includes("evidence_path")) {

        await db.exec(
            "ALTER TABLE reports ADD COLUMN evidence_path TEXT"
        );

    }


    if (!columnNames.includes("evidence_name")) {

        await db.exec(
            "ALTER TABLE reports ADD COLUMN evidence_name TEXT"
        );

    }


    // Create demo users

    const existingAdmin =
        await db.get(
            "SELECT * FROM users WHERE email = ?",
            ["admin@example.com"]
        );


    if (!existingAdmin) {

        const password =
            await bcrypt.hash("admin123", 10);

        await db.run(
            `
            INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)
            `,
            [
                "Administrator",
                "admin@example.com",
                password,
                "admin"
            ]
        );
    }


    const existingUser =
        await db.get(
            "SELECT * FROM users WHERE email = ?",
            ["user@example.com"]
        );


    if (!existingUser) {

        const password =
            await bcrypt.hash("user123", 10);

        await db.run(
            `
            INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)
            `,
            [
                "Demo User",
                "user@example.com",
                password,
                "user"
            ]
        );
    }


    console.log("Database connected");
}


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

function requireLogin(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({
            error: "Please login first"
        });

    }

    next();
}


function requireAdmin(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({
            error: "Please login first"
        });

    }


    if (req.session.user.role !== "admin") {

        return res.status(403).json({
            error: "Admin access required"
        });

    }

    next();
}


// ==========================================
// REGISTER
// ==========================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                error: "All fields are required"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                error: "Password must contain at least 6 characters"
            });

        }


        const existing =
            await db.get(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );


        if (existing) {

            return res.status(409).json({
                error: "Email already registered"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        await db.run(
            `
            INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)
            `,
            [
                name.trim(),
                email.trim().toLowerCase(),
                hashedPassword,
                "user"
            ]
        );


        res.status(201).json({
            message: "Registration successful"
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Registration failed"
        });

    }

});


// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const user =
            await db.get(
                "SELECT * FROM users WHERE email = ?",
                [email.trim().toLowerCase()]
            );


        if (!user) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordCorrect) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        req.session.user = {

            id: user.id,

            name: user.name,

            email: user.email,

            role: user.role
        };


        res.json({

            message: "Login successful",

            user: req.session.user

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Login failed"
        });

    }

});


// ==========================================
// CURRENT USER
// ==========================================

app.get(
    "/api/me",
    (req, res) => {

        if (!req.session.user) {

            return res.json({
                loggedIn: false
            });

        }


        res.json({

            loggedIn: true,

            user: req.session.user

        });

    }
);


// ==========================================
// LOGOUT
// ==========================================

app.post(
    "/api/logout",
    (req, res) => {

        req.session.destroy(() => {

            res.json({
                message: "Logged out successfully"
            });

        });

    }
);


// ==========================================
// GET REPORTS
// ==========================================

app.get(
    "/api/reports",
    requireLogin,
    async (req, res) => {

        try {

            let query =
                "SELECT * FROM reports";

            let params = [];


            // Normal users see their own reports.
            // Admin sees all reports.

            if (
                req.session.user.role !== "admin"
            ) {

                query +=
                    " WHERE user_id = ?";

                params.push(
                    req.session.user.id
                );

            }


            query +=
                " ORDER BY id DESC";


            const reports =
                await db.all(
                    query,
                    params
                );


            res.json(reports);


        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Failed to retrieve reports"
            });

        }

    }
);


// ==========================================
// GET SINGLE REPORT
// ==========================================

app.get(
    "/api/reports/:id",
    requireLogin,
    async (req, res) => {

        try {

            const report =
                await db.get(
                    "SELECT * FROM reports WHERE id = ?",
                    [req.params.id]
                );


            if (!report) {

                return res.status(404).json({
                    error: "Report not found"
                });

            }


            if (
                req.session.user.role !== "admin" &&
                report.user_id !== req.session.user.id
            ) {

                return res.status(403).json({
                    error: "You cannot access this report"
                });

            }


            res.json(report);


        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Failed to retrieve report"
            });

        }

    }
);


// ==========================================
// CREATE REPORT
// ==========================================

app.post(
    "/api/reports",
    requireLogin,
    upload.single("evidence"),
    async (req, res) => {

        try {

            const {
                reporter_name,
                contact,
                incident_date,
                transaction_id,
                amount,
                incident_type,
                description,
                additional_info
            } = req.body;


            if (
                !reporter_name ||
                !contact ||
                !incident_date ||
                !amount ||
                !incident_type ||
                !description
            ) {

                return res.status(400).json({
                    error: "Please fill all required fields"
                });

            }


            if (Number(amount) < 0) {

                return res.status(400).json({
                    error: "Amount cannot be negative"
                });

            }


            let evidencePath = null;

            let evidenceName = null;


            if (req.file) {

                evidencePath =
                    "/uploads/" +
                    req.file.filename;

                evidenceName =
                    req.file.originalname;

            }


            const result =
                await db.run(
                    `
                    INSERT INTO reports
                    (
                        reporter_name,
                        contact,
                        incident_date,
                        transaction_id,
                        amount,
                        incident_type,
                        description,
                        additional_info,
                        status,
                        user_id,
                        evidence_path,
                        evidence_name
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [

                        reporter_name.trim(),

                        contact.trim(),

                        incident_date,

                        transaction_id
                            ? transaction_id.trim()
                            : "",

                        Number(amount),

                        incident_type,

                        description.trim(),

                        additional_info
                            ? additional_info.trim()
                            : "",

                        "New",

                        req.session.user.id,

                        evidencePath,

                        evidenceName
                    ]
                );


            const newReport =
                await db.get(
                    "SELECT * FROM reports WHERE id = ?",
                    [result.lastID]
                );


            res.status(201).json(newReport);


        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: error.message ||
                    "Failed to create report"
            });

        }

    }
);


// ==========================================
// UPDATE REPORT
// ==========================================

app.put(
    "/api/reports/:id",
    requireLogin,
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const existing =
                await db.get(
                    "SELECT * FROM reports WHERE id = ?",
                    [id]
                );


            if (!existing) {

                return res.status(404).json({
                    error: "Report not found"
                });

            }


            if (
                req.session.user.role !== "admin" &&
                existing.user_id !== req.session.user.id
            ) {

                return res.status(403).json({
                    error: "You cannot edit this report"
                });

            }


            const {

                reporter_name,

                contact,

                incident_date,

                transaction_id,

                amount,

                incident_type,

                description,

                additional_info,

                status

            } = req.body;


            const allowedStatuses = [

                "New",

                "Under Review",

                "Resolved",

                "Rejected"

            ];


            if (
                req.session.user.role === "admin" &&
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({
                    error: "Invalid status"
                });

            }


            const finalStatus =
                req.session.user.role === "admin"
                    ? status
                    : existing.status;


            await db.run(
                `
                UPDATE reports
                SET

                    reporter_name = ?,

                    contact = ?,

                    incident_date = ?,

                    transaction_id = ?,

                    amount = ?,

                    incident_type = ?,

                    description = ?,

                    additional_info = ?,

                    status = ?

                WHERE id = ?
                `,
                [

                    reporter_name.trim(),

                    contact.trim(),

                    incident_date,

                    transaction_id
                        ? transaction_id.trim()
                        : "",

                    Number(amount),

                    incident_type,

                    description.trim(),

                    additional_info
                        ? additional_info.trim()
                        : "",

                    finalStatus,

                    id

                ]
            );


            const updated =
                await db.get(
                    "SELECT * FROM reports WHERE id = ?",
                    [id]
                );


            res.json(updated);


        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Failed to update report"
            });

        }

    }
);


// ==========================================
// DELETE REPORT
// ==========================================

app.delete(
    "/api/reports/:id",
    requireLogin,
    async (req, res) => {

        try {

            const report =
                await db.get(
                    "SELECT * FROM reports WHERE id = ?",
                    [req.params.id]
                );


            if (!report) {

                return res.status(404).json({
                    error: "Report not found"
                });

            }


            if (
                req.session.user.role !== "admin" &&
                report.user_id !== req.session.user.id
            ) {

                return res.status(403).json({
                    error: "You cannot delete this report"
                });

            }


            await db.run(
                "DELETE FROM reports WHERE id = ?",
                [req.params.id]
            );


            res.json({
                message: "Report deleted successfully"
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Failed to delete report"
            });

        }

    }
);


// ==========================================
// DASHBOARD STATISTICS
// ==========================================

app.get(
    "/api/dashboard",
    requireLogin,
    async (req, res) => {

        try {

            let where = "";

            let params = [];


            if (
                req.session.user.role !== "admin"
            ) {

                where =
                    " WHERE user_id = ?";

                params = [
                    req.session.user.id
                ];

            }


            const total =
                await db.get(
                    `SELECT COUNT(*) AS count
                     FROM reports${where}`,
                    params
                );


            const newCount =
                await db.get(
                    `SELECT COUNT(*) AS count
                     FROM reports
                     ${where ? where + " AND" : " WHERE"}
                     status = 'New'`,
                    params
                );


            const reviewCount =
                await db.get(
                    `SELECT COUNT(*) AS count
                     FROM reports
                     ${where ? where + " AND" : " WHERE"}
                     status = 'Under Review'`,
                    params
                );


            const resolvedCount =
                await db.get(
                    `SELECT COUNT(*) AS count
                     FROM reports
                     ${where ? where + " AND" : " WHERE"}
                     status = 'Resolved'`,
                    params
                );


            const amount =
                await db.get(
                    `SELECT COALESCE(SUM(amount), 0) AS total
                     FROM reports${where}`,
                    params
                );


            res.json({

                total: total.count,

                newReports: newCount.count,

                underReview: reviewCount.count,

                resolved: resolvedCount.count,

                totalAmount: amount.total

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Failed to load dashboard"
            });

        }

    }
);


// ==========================================
// EXPORT CSV
// ==========================================

app.get(
    "/api/export",
    requireLogin,
    async (req, res) => {

        try {

            let query =
                "SELECT * FROM reports";

            let params = [];


            if (
                req.session.user.role !== "admin"
            ) {

                query +=
                    " WHERE user_id = ?";

                params.push(
                    req.session.user.id
                );

            }


            query +=
                " ORDER BY id DESC";


            const reports =
                await db.all(
                    query,
                    params
                );


            let csv =
                "ID,Reporter,Contact,Date,Transaction ID,Amount,Incident Type,Description,Status\n";


            reports.forEach(report => {

                const row = [

                    report.id,

                    report.reporter_name,

                    report.contact,

                    report.incident_date,

                    report.transaction_id || "",

                    report.amount,

                    report.incident_type,

                    report.description,

                    report.status

                ];


                csv += row.map(value => {

                    return `"${String(value)
                        .replace(/"/g, '""')}"`;

                }).join(",");


                csv += "\n";

            });


            res.header(
                "Content-Type",
                "text/csv"
            );


            res.attachment(
                "fraud-reports.csv"
            );


            res.send(csv);


        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Export failed"
            });

        }

    }
);


// ==========================================
// UPLOAD ERROR HANDLER
// ==========================================

app.use(
    (error, req, res, next) => {

        if (
            error instanceof multer.MulterError
        ) {

            return res.status(400).json({
                error: "File upload failed. Maximum file size is 5MB."
            });

        }


        if (error) {

            return res.status(400).json({
                error: error.message
            });

        }


        next();

    }
);


// ==========================================
// START SERVER
// ==========================================

connectDatabase()
    .then(() => {

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running at http://localhost:${PORT}`
                );

            }
        );

    })
    .catch(error => {

        console.error(
            "Database connection failed:",
            error
        );

    });