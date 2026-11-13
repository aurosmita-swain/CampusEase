const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

const PORT = 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {

    res.send("CampusEase server is running!");

});


// =====================================================
// SIGNUP API
// =====================================================

app.post("/api/signup", (req, res) => {

    const {
        name,
        email,
        role,
        studentType,
        hostelBlock,
        department,
        section,
        userId,
        password
    } = req.body;


    if (
        !name ||
        !email ||
        !role ||
        !userId ||
        !password
    ) {

        return res.status(400).json({
            message:
                "Please fill all required fields."
        });

    }


    // -------------------------------
    // STUDENT VALIDATION
    // -------------------------------

    if (role === "student") {

        if (!studentType) {

            return res.status(400).json({
                message:
                    "Please select Day Scholar or Hosteller."
            });

        }


        if (!department) {

            return res.status(400).json({
                message:
                    "Department is required for students."
            });

        }


        if (!section) {

            return res.status(400).json({
                message:
                    "Section is required for students."
            });

        }


        if (
            studentType === "hosteller" &&
            !hostelBlock
        ) {

            return res.status(400).json({
                message:
                    "Hostel block is required for hostellers."
            });

        }

    }


    // -------------------------------
    // FACULTY VALIDATION
    // -------------------------------

    if (
        role === "faculty" &&
        !department
    ) {

        return res.status(400).json({
            message:
                "Department is required for faculty."
        });

    }


    // -------------------------------
    // CHECK EMAIL
    // -------------------------------

    const checkEmailSQL = `
        SELECT id
        FROM users
        WHERE email = ?
    `;


    db.query(
        checkEmailSQL,
        [email],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Database error."
                });

            }


            if (results.length > 0) {

                return res.status(409).json({
                    message:
                        "Email already registered."
                });

            }


            // -------------------------------
            // CHECK USER ID
            // -------------------------------

            const checkUserIdSQL = `
                SELECT id
                FROM users
                WHERE user_id = ?
            `;


            db.query(
                checkUserIdSQL,
                [userId],

                (err, results) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({
                            message:
                                "Database error."
                        });

                    }


                    if (results.length > 0) {

                        return res.status(409).json({
                            message:
                                "User ID already registered."
                        });

                    }


                    // -------------------------------
                    // INSERT USER
                    // -------------------------------

                    const insertSQL = `
                        INSERT INTO users
                        (
                            name,
                            email,
                            role,
                            student_type,
                            hostel_block,
                            department,
                            section,
                            user_id,
                            password
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;


                    db.query(
                        insertSQL,

                        [
                            name,
                            email,
                            role,

                            role === "student"
                                ? studentType
                                : null,

                            role === "student" &&
                            studentType === "hosteller"
                                ? hostelBlock
                                : null,

                            department || null,

                            role === "student"
                                ? section
                                : null,

                            userId,
                            password
                        ],

                        (err, result) => {

                            if (err) {

                                console.error(err);

                                return res.status(500).json({
                                    message:
                                        "Failed to create account."
                                });

                            }


                            res.status(201).json({

                                message:
                                    "Account created successfully.",

                                userId:
                                    result.insertId

                            });

                        }
                    );

                }
            );

        }
    );

});


// =====================================================
// LOGIN API
// =====================================================

app.post("/api/login", (req, res) => {

    const {
        email,
        password,
        role
    } = req.body;


    if (
        !email ||
        !password ||
        !role
    ) {

        return res.status(400).json({
            message:
                "Please fill all login fields."
        });

    }


    const sql = `
        SELECT
            id,
            name,
            email,
            role,
            student_type,
            hostel_block,
            department,
            section,
            user_id
        FROM users
        WHERE email = ?
        AND password = ?
        AND role = ?
    `;


    db.query(
        sql,

        [
            email,
            password,
            role
        ],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Database error."
                });

            }


            if (results.length === 0) {

                return res.status(401).json({
                    message:
                        "Invalid email, password or role."
                });

            }


            const user =
                results[0];


            // -------------------------------
            // FACULTY-SPECIFIC INFORMATION
            // -------------------------------

            if (user.role === "faculty") {

                const facultySql = `
                    SELECT
                        id,
                        faculty_id,
                        designation,
                        department,
                        office_room,
                        phone
                    FROM faculty
                    WHERE user_id = ?
                `;


                db.query(
                    facultySql,
                    [user.id],

                    (facultyErr, facultyResults) => {

                        if (facultyErr) {

                            console.error(
                                "Faculty login error:",
                                facultyErr
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to load faculty information."
                            });

                        }


                        if (
                            facultyResults.length === 0
                        ) {

                            return res.status(404).json({
                                message:
                                    "Faculty profile not found."
                            });

                        }


                        user.faculty_id =
                            facultyResults[0].faculty_id;

                        user.faculty_db_id =
                            facultyResults[0].id;

                        user.designation =
                            facultyResults[0].designation;

                        user.office_room =
                            facultyResults[0].office_room;

                        user.phone =
                            facultyResults[0].phone;


                        return res.status(200).json({

                            message:
                                "Login successful.",

                            user:
                                user

                        });

                    }
                );

                return;
            }


            // -------------------------------
            // NORMAL STUDENT / ADMIN LOGIN
            // -------------------------------

            res.status(200).json({

                message:
                    "Login successful.",

                user:
                    user

            });

        }
    );

});


// =====================================================
// DIGITAL QUEUE - JOIN
// =====================================================

app.post("/api/queue/join", (req, res) => {

    const {
        userId,
        service
    } = req.body;


    if (
        !userId ||
        !service
    ) {

        return res.status(400).json({
            message:
                "User and service are required."
        });

    }


    const tokenSQL = `
        SELECT
            MAX(token_number) AS lastToken
        FROM queue_tokens
        WHERE service = ?
    `;


    db.query(
        tokenSQL,
        [service],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Database error."
                });

            }


            const lastToken =
                results[0].lastToken || 0;


            const newToken =
                lastToken + 1;


            const positionSQL = `
                SELECT
                    COUNT(*) AS queuePosition
                FROM queue_tokens
                WHERE service = ?
                AND status = 'Waiting'
            `;


            db.query(
                positionSQL,
                [service],

                (err, positionResults) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({
                            message:
                                "Failed to calculate queue position."
                        });

                    }


                    const queuePosition =
                        positionResults[0].queuePosition + 1;


                    const insertSQL = `
                        INSERT INTO queue_tokens
                        (
                            user_id,
                            service,
                            token_number,
                            status
                        )
                        VALUES (?, ?, ?, 'Waiting')
                    `;


                    db.query(
                        insertSQL,

                        [
                            userId,
                            service,
                            newToken
                        ],

                        (err, result) => {

                            if (err) {

                                console.error(err);

                                return res.status(500).json({
                                    message:
                                        "Failed to generate token."
                                });

                            }


                            res.status(201).json({

                                message:
                                    "Digital token generated successfully.",

                                token:
                                    newToken,

                                tokenNumber:
                                    newToken,

                                service:
                                    service,

                                queuePosition:
                                    queuePosition,

                                status:
                                    "Waiting"

                            });

                        }
                    );

                }
            );

        }
    );

});


// =====================================================
// DIGITAL QUEUE - GET ACTIVE USER TOKEN
// =====================================================

app.get("/api/queue/user/:userId", (req, res) => {

    const userId =
        req.params.userId;


    const sql = `
        SELECT
            id,
            service,
            token_number,
            status,
            created_at
        FROM queue_tokens
        WHERE user_id = ?
        AND status IN ('Waiting', 'Serving')
        ORDER BY id DESC
        LIMIT 1
    `;


    db.query(
        sql,
        [userId],

        (err, results) => {

            if (err) {

                console.error(
                    "Load queue token error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to load queue token."
                });

            }


            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "No active queue token found."
                });

            }


            res.status(200).json({

                token:
                    results[0]

            });

        }
    );

});


// =====================================================
// ADMIN - GET ALL QUEUE TOKENS
// =====================================================

app.get("/api/admin/queue", (req, res) => {

    const sql = `
        SELECT
            queue_tokens.id,
            queue_tokens.user_id,
            queue_tokens.service,
            queue_tokens.token_number,
            queue_tokens.status,
            queue_tokens.created_at,
            users.name AS student_name,
            users.user_id AS user_id_number
        FROM queue_tokens
        JOIN users
            ON queue_tokens.user_id = users.id
        ORDER BY
            CASE
                WHEN queue_tokens.status = 'Waiting' THEN 1
                WHEN queue_tokens.status = 'Serving' THEN 2
                WHEN queue_tokens.status = 'Completed' THEN 3
                ELSE 4
            END,
            queue_tokens.created_at ASC
    `;


    db.query(
        sql,

        (err, results) => {

            if (err) {

                console.error(
                    "Admin queue error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to load queue data."
                });

            }


            res.status(200).json(
                results
            );

        }
    );

});


// =====================================================
// ADMIN - UPDATE QUEUE TOKEN STATUS
// =====================================================

app.put("/api/admin/queue/:id/status", (req, res) => {

    const queueId =
        req.params.id;


    const {
        status
    } = req.body;


    const allowedStatuses = [
        "Waiting",
        "Serving",
        "Completed"
    ];


    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message:
                "Invalid queue status."
        });

    }


    const sql = `
        UPDATE queue_tokens
        SET status = ?
        WHERE id = ?
    `;


    db.query(
        sql,

        [
            status,
            queueId
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "Update queue status error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to update queue status."
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Queue token not found."
                });

            }


            res.status(200).json({

                message:
                    "Queue status updated successfully.",

                status:
                    status

            });

        }
    );

});


// =====================================================
// STUDENT - SUBMIT LEAVE REQUEST
// =====================================================

app.post("/api/leave", (req, res) => {

    const {
        userId,
        fromDate,
        toDate,
        reason
    } = req.body;


    if (
        !userId ||
        !fromDate ||
        !toDate ||
        !reason
    ) {

        return res.status(400).json({
            message:
                "All leave fields are required."
        });

    }


    if (toDate < fromDate) {

        return res.status(400).json({
            message:
                "To Date cannot be before From Date."
        });

    }


    // ---------------------------------------------
    // GET STUDENT INFORMATION
    // ---------------------------------------------

    const userSQL = `
        SELECT
            name,
            student_type,
            hostel_block
        FROM users
        WHERE id = ?
    `;


    db.query(
        userSQL,
        [userId],

        (err, userResults) => {

            if (err) {

                console.error(
                    "Leave user lookup error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Database error."
                });

            }


            if (userResults.length === 0) {

                return res.status(404).json({
                    message:
                        "User not found."
                });

            }


            const user =
                userResults[0];


            // ---------------------------------------------
            // DETERMINE NOTIFICATION ROLE
            // ---------------------------------------------

            let notificationRole =
                null;


            if (
                user.student_type === "hosteller" &&
                user.hostel_block
            ) {

                const hostel =
                    user.hostel_block.toLowerCase();


                if (
                    hostel.includes("boys")
                ) {

                    notificationRole =
                        "Boys Hostel Warden";

                }

                else if (
                    hostel.includes("girls")
                ) {

                    notificationRole =
                        "Girls Hostel Warden";

                }

            }


            // ---------------------------------------------
            // INSERT LEAVE REQUEST
            // ---------------------------------------------

            const insertSQL = `
                INSERT INTO leave_requests
                (
                    user_id,
                    from_date,
                    to_date,
                    reason,
                    notification_role
                )
                VALUES (?, ?, ?, ?, ?)
            `;


            db.query(
                insertSQL,

                [
                    userId,
                    fromDate,
                    toDate,
                    reason,
                    notificationRole
                ],

                (err, result) => {

                    if (err) {

                        console.error(
                            "Leave insert error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to submit leave request."
                        });

                    }


                    // ---------------------------------------------
                    // SEND WARDEN NOTIFICATION
                    // ---------------------------------------------

                    if (notificationRole) {

                        const message =
                            `${user.name} submitted a leave request from ${fromDate} to ${toDate}.`;


                        const notificationSQL = `
                            INSERT INTO warden_notifications
                            (
                                user_id,
                                notification_role,
                                message,
                                type
                            )
                            VALUES (?, ?, ?, ?)
                        `;


                        db.query(
                            notificationSQL,

                            [
                                userId,
                                notificationRole,
                                message,
                                "Leave Request"
                            ],

                            (notificationErr) => {

                                if (notificationErr) {

                                    console.error(
                                        "Leave notification error:",
                                        notificationErr
                                    );

                                }

                            }
                        );

                    }


                    res.status(201).json({

                        message:
                            "Leave request submitted successfully.",

                        requestId:
                            result.insertId,

                        notificationRole:
                            notificationRole

                    });

                }
            );

        }
    );

});


// =====================================================
// STUDENT - GET LATEST LEAVE REQUEST
// =====================================================

app.get("/api/leave/:userId", (req, res) => {

    const userId =
        req.params.userId;


    const sql = `
        SELECT
            id,
            user_id,
            from_date,
            to_date,
            reason,
            status,
            notification_role,
            created_at
        FROM leave_requests
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    `;


    db.query(
        sql,
        [userId],

        (err, results) => {

            if (err) {

                console.error(
                    "Student leave fetch error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Database error."
                });

            }


            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "No leave request found."
                });

            }


            res.status(200).json({

                request:
                    results[0]

            });

        }
    );

});


// =====================================================
// ADMIN - GET ALL LEAVE REQUESTS
// =====================================================

app.get("/api/leave", (req, res) => {

    const sql = `
        SELECT
            lr.id,
            lr.user_id,
            lr.from_date,
            lr.to_date,
            lr.reason,
            lr.status,
            lr.notification_role,
            lr.created_at,
            u.name AS student_name,
            u.user_id AS student_id
        FROM leave_requests AS lr
        LEFT JOIN users AS u
            ON lr.user_id = u.id
        ORDER BY lr.id DESC
    `;


    db.query(
        sql,

        (err, results) => {

            if (err) {

                console.error("====================================");
                console.error("ADMIN LEAVE SQL ERROR");
                console.error("Message:", err.message);
                console.error("Code:", err.code);
                console.error("SQL State:", err.sqlState);
                console.error("Full Error:", err);
                console.error("====================================");

                return res.status(500).json({

                    message:
                        "Failed to load leave requests.",

                    error:
                        err.message,

                    code:
                        err.code,

                    sqlState:
                        err.sqlState

                });

            }


            console.log(
                "Admin leave requests loaded:",
                results.length
            );


            res.status(200).json({

                requests:
                    results

            });

        }
    );

});


// =====================================================
// ADMIN - UPDATE LEAVE REQUEST STATUS
// =====================================================

app.put("/api/leave/:id/status", (req, res) => {

    const leaveId =
        req.params.id;


    const {
        status
    } = req.body;


    const allowedStatuses = [
        "Pending",
        "Approved",
        "Rejected"
    ];


    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message:
                "Invalid leave status."
        });

    }


    const sql = `
        UPDATE leave_requests
        SET status = ?
        WHERE id = ?
    `;


    db.query(
        sql,

        [
            status,
            leaveId
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "UPDATE LEAVE ERROR:",
                    err
                );

                return res.status(500).json({

                    message:
                        "Failed to update leave request.",

                    error:
                        err.message,

                    code:
                        err.code,

                    sqlState:
                        err.sqlState

                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Leave request not found."
                });

            }


            res.status(200).json({

                message:
                    "Leave request status updated successfully.",

                status:
                    status

            });

        }
    );

});


// =====================================================
// SUBMIT PROBLEM REPORT
// =====================================================

app.post("/api/problems", (req, res) => {

    const {
        userId,
        title,
        category,
        location,
        description
    } = req.body;


    if (
        !userId ||
        !title ||
        !category ||
        !location ||
        !description
    ) {

        return res.status(400).json({
            message:
                "All fields are required."
        });

    }


    const userSQL = `
        SELECT
            name,
            student_type,
            hostel_block
        FROM users
        WHERE id = ?
    `;


    db.query(
        userSQL,
        [userId],

        (err, userResults) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Database error."
                });

            }


            if (userResults.length === 0) {

                return res.status(404).json({
                    message:
                        "User not found."
                });

            }


            const user =
                userResults[0];


            let notificationRole =
                null;


            if (
                category.toLowerCase() === "hostel" &&
                user.student_type === "hosteller" &&
                user.hostel_block
            ) {

                const hostel =
                    user.hostel_block.toLowerCase();


                if (
                    hostel.includes("boys")
                ) {

                    notificationRole =
                        "Boys Hostel Warden";

                }

                else if (
                    hostel.includes("girls")
                ) {

                    notificationRole =
                        "Girls Hostel Warden";

                }

            }


            const sql = `
                INSERT INTO problem_reports
                (
                    user_id,
                    title,
                    category,
                    location,
                    description,
                    notification_role
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;


            db.query(
                sql,

                [
                    userId,
                    title,
                    category,
                    location,
                    description,
                    notificationRole
                ],

                (err, result) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).json({
                            message:
                                "Failed to submit problem report."
                        });

                    }


                    if (notificationRole) {

                        const message =
                            `${user.name} reported a hostel problem: ${title} at ${location}.`;


                        const notificationSQL = `
                            INSERT INTO warden_notifications
                            (
                                user_id,
                                notification_role,
                                message,
                                type
                            )
                            VALUES (?, ?, ?, ?)
                        `;


                        db.query(
                            notificationSQL,

                            [
                                userId,
                                notificationRole,
                                message,
                                "Hostel Problem"
                            ],

                            (notificationErr) => {

                                if (notificationErr) {

                                    console.error(
                                        "Notification error:",
                                        notificationErr
                                    );

                                }

                            }
                        );

                    }


                    res.status(201).json({

                        message:
                            "Problem reported successfully.",

                        reportId:
                            result.insertId,

                        notificationRole:
                            notificationRole

                    });

                }
            );

        }
    );

});


// =====================================================
// GET USER PROBLEM REPORTS
// =====================================================

app.get("/api/problems/user/:userId", (req, res) => {

    const userId =
        req.params.userId;


    const sql = `
        SELECT
            id,
            title,
            category,
            location,
            description,
            status,
            notification_role,
            assigned_to,
            created_at
        FROM problem_reports
        WHERE user_id = ?
        ORDER BY id DESC
    `;


    db.query(
        sql,
        [userId],

        (err, results) => {

            if (err) {

                console.error(
                    "User problem reports error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to load problem reports."
                });

            }


            res.status(200).json(
                results
            );

        }
    );

});


// =====================================================
// ADMIN - GET ALL PROBLEM REPORTS
// =====================================================

app.get("/api/admin/problems", (req, res) => {

    const sql = `
        SELECT
            problem_reports.id,
            problem_reports.user_id,
            problem_reports.title,
            problem_reports.category,
            problem_reports.location,
            problem_reports.description,
            problem_reports.status,
            problem_reports.notification_role,
            problem_reports.assigned_to,
            problem_reports.created_at,
            users.name AS student_name,
            users.user_id AS user_id_number
        FROM problem_reports
        JOIN users
            ON problem_reports.user_id = users.id
        ORDER BY problem_reports.created_at DESC
    `;


    db.query(
        sql,

        (err, results) => {

            if (err) {

                console.error(
                    "Admin problem reports error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to load problem reports."
                });

            }


            res.status(200).json(
                results
            );

        }
    );

});


// =====================================================
// ADMIN - ASSIGN MAINTENANCE AND UPDATE PROBLEM STATUS
// =====================================================

app.put("/api/admin/problems/:id/status", (req, res) => {

    const problemId =
        req.params.id;


    const {
        status,
        assignedTo
    } = req.body;


    const allowedStatuses = [
        "Pending",
        "In Progress",
        "Resolved"
    ];


    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message:
                "Invalid problem status."
        });

    }


    const sql = `
        UPDATE problem_reports
        SET
            status = ?,
            assigned_to = ?
        WHERE id = ?
    `;


    db.query(
        sql,

        [
            status,
            assignedTo || null,
            problemId
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "Update problem error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to update problem."
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Problem report not found."
                });

            }


            res.status(200).json({

                message:
                    "Problem updated successfully.",

                status:
                    status,

                assignedTo:
                    assignedTo || null

            });

        }
    );

});


// =====================================================
// DOCUMENT REQUEST
// =====================================================

app.post("/api/documents", (req, res) => {

    const {
        userId,
        documentType,
        purpose
    } = req.body;


    if (
        !userId ||
        !documentType ||
        !purpose
    ) {

        return res.status(400).json({
            message:
                "Please fill all document request fields."
        });

    }


    const sql = `
        INSERT INTO document_requests
        (
            user_id,
            document_type,
            purpose
        )
        VALUES (?, ?, ?)
    `;


    db.query(
        sql,

        [
            userId,
            documentType,
            purpose
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "Document request error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to submit document request."
                });

            }


            res.status(201).json({

                message:
                    "Document request submitted successfully.",

                requestId:
                    result.insertId

            });

        }
    );

});


// =====================================================
// GET LATEST DOCUMENT REQUEST FOR USER
// =====================================================

app.get("/api/documents/:userId", (req, res) => {

    const userId =
        req.params.userId;


    const sql = `
        SELECT
            id,
            document_type,
            purpose,
            status,
            created_at
        FROM document_requests
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;


    db.query(
        sql,
        [userId],

        (err, results) => {

            if (err) {

                console.error(
                    "Document request fetch error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to load document request."
                });

            }


            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "No document request found."
                });

            }


            res.status(200).json({

                request:
                    results[0]

            });

        }
    );

});


// =====================================================
// ADMIN - GET DOCUMENT REQUESTS
// =====================================================

app.get("/api/admin/documents", (req, res) => {

    const sql = `
        SELECT
            document_requests.id,
            document_requests.document_type,
            document_requests.purpose,
            document_requests.status,
            document_requests.created_at,
            users.name AS student_name,
            users.user_id AS user_id_number
        FROM document_requests
        JOIN users
            ON document_requests.user_id = users.id
        ORDER BY document_requests.created_at DESC
    `;


    db.query(
        sql,

        (err, results) => {

            if (err) {

                console.error(
                    "Admin document request error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to load document requests."
                });

            }


            res.status(200).json({

                requests:
                    results

            });

        }
    );

});


// =====================================================
// ADMIN - UPDATE DOCUMENT REQUEST STATUS
// =====================================================

app.put("/api/admin/documents/:id/status", (req, res) => {

    const requestId =
        req.params.id;


    const {
        status
    } = req.body;


    const allowedStatuses = [
        "Pending",
        "Processing",
        "Completed"
    ];


    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message:
                "Invalid document request status."
        });

    }


    const sql = `
        UPDATE document_requests
        SET
            status = ?
        WHERE id = ?
    `;


    db.query(
        sql,

        [
            status,
            requestId
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "Update document request error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to update document request."
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Document request not found."
                });

            }


            res.status(200).json({

                message:
                    "Document request status updated successfully.",

                status:
                    status

            });

        }
    );

});


// =====================================================
// ADMIN - CAMPUS OVERVIEW STATS
// =====================================================

app.get("/api/admin/stats", (req, res) => {

    const stats = {};


    // ---------------------------------------------
    // 1. TOTAL STUDENTS
    // ---------------------------------------------

    const studentSql = `
        SELECT COUNT(*) AS total
        FROM users
        WHERE role = 'student'
    `;


    db.query(
        studentSql,

        (err, studentResult) => {

            if (err) {

                console.error(
                    "Total students error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to load total students."
                });

            }


            stats.totalStudents =
                studentResult[0].total;


            // ---------------------------------------------
            // 2. PENDING REQUESTS
            // ---------------------------------------------

            const requestSql = `
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM document_requests
                        WHERE status = 'Pending'
                    )
                    +
                    (
                        SELECT COUNT(*)
                        FROM leave_requests
                        WHERE status = 'Pending'
                    )
                    AS total
            `;


            db.query(
                requestSql,

                (err, requestResult) => {

                    if (err) {

                        console.error(
                            "Pending requests error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to load pending requests."
                        });

                    }


                    stats.pendingRequests =
                        requestResult[0].total;


                    // ---------------------------------------------
                    // 3. ACTIVE PROBLEMS
                    // ---------------------------------------------

                    const problemSql = `
                        SELECT COUNT(*) AS total
                        FROM problem_reports
                        WHERE status IN (
                            'Pending',
                            'In Progress'
                        )
                    `;


                    db.query(
                        problemSql,

                        (err, problemResult) => {

                            if (err) {

                                console.error(
                                    "Active problems error:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to load active problems."
                                });

                            }


                            stats.activeProblems =
                                problemResult[0].total;


                            // ---------------------------------------------
                            // 4. ACTIVE QUEUE TOKENS
                            // ---------------------------------------------

                            const queueSql = `
                                SELECT COUNT(*) AS total
                                FROM queue_tokens
                                WHERE status IN (
                                    'Waiting',
                                    'Serving'
                                )
                            `;


                            db.query(
                                queueSql,

                                (err, queueResult) => {

                                    if (err) {

                                        console.error(
                                            "Queue tokens error:",
                                            err
                                        );

                                        return res.status(500).json({
                                            message:
                                                "Failed to load queue tokens."
                                        });

                                    }


                                    stats.queueTokens =
                                        queueResult[0].total;


                                    res.status(200).json({

                                        totalStudents:
                                            stats.totalStudents,

                                        pendingRequests:
                                            stats.pendingRequests,

                                        activeProblems:
                                            stats.activeProblems,

                                        queueTokens:
                                            stats.queueTokens

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


// =====================================================
// ADMIN - SAVE STUDENT FEE DETAILS
// =====================================================

app.post("/api/admin/fees", (req, res) => {

    const {
        studentId,
        courseFee,
        hostelFee
    } = req.body;


    if (
        !studentId ||
        courseFee === undefined ||
        hostelFee === undefined
    ) {

        return res.status(400).json({
            message:
                "Please provide all fee details."
        });

    }


    const totalAmount =
        Number(courseFee) +
        Number(hostelFee);


    const findStudentSql = `
        SELECT id
        FROM users
        WHERE user_id = ?
        AND role = 'student'
    `;


    db.query(
        findStudentSql,
        [studentId],

        (err, studentResult) => {

            if (err) {

                console.error(
                    "Find student error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to find student."
                });

            }


            if (studentResult.length === 0) {

                return res.status(404).json({
                    message:
                        "Student not found."
                });

            }


            const userId =
                studentResult[0].id;


            const checkSql = `
                SELECT id
                FROM student_fees
                WHERE user_id = ?
            `;


            db.query(
                checkSql,
                [userId],

                (err, feeResult) => {

                    if (err) {

                        console.error(
                            "Check fee error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check fee record."
                        });

                    }


                    if (feeResult.length > 0) {

                        const updateSql = `
                            UPDATE student_fees
                            SET
                                course_fee = ?,
                                hostel_fee = ?,
                                total_amount = ?,
                                remaining_amount =
                                    ? - paid_amount
                            WHERE user_id = ?
                        `;


                        db.query(
                            updateSql,

                            [
                                courseFee,
                                hostelFee,
                                totalAmount,
                                totalAmount,
                                userId
                            ],

                            (err) => {

                                if (err) {

                                    console.error(
                                        "Update fee error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to update fee details."
                                    });

                                }


                                res.status(200).json({

                                    message:
                                        "Fee details updated successfully.",

                                    totalAmount:
                                        totalAmount

                                });

                            }
                        );

                    }

                    else {

                        const insertSql = `
                            INSERT INTO student_fees
                            (
                                user_id,
                                course_fee,
                                hostel_fee,
                                total_amount,
                                paid_amount,
                                remaining_amount,
                                payment_status
                            )
                            VALUES (?, ?, ?, ?, 0, ?, 'Pending')
                        `;


                        db.query(
                            insertSql,

                            [
                                userId,
                                courseFee,
                                hostelFee,
                                totalAmount,
                                totalAmount
                            ],

                            (err) => {

                                if (err) {

                                    console.error(
                                        "Insert fee error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to save fee details."
                                    });

                                }


                                res.status(201).json({

                                    message:
                                        "Fee details saved successfully.",

                                    totalAmount:
                                        totalAmount

                                });

                            }
                        );

                    }

                }
            );

        }
    );

});


// =====================================================
// ADMIN - GET ALL STUDENT FEE RECORDS
// =====================================================

app.get("/api/admin/fees", (req, res) => {

    const sql = `
        SELECT
            student_fees.id,
            users.name,
            users.user_id,
            users.department,
            users.section,
            users.student_type,
            student_fees.course_fee,
            student_fees.hostel_fee,
            student_fees.total_amount,
            student_fees.paid_amount,
            student_fees.remaining_amount,
            student_fees.payment_status,
            student_fees.last_payment_date
        FROM student_fees
        INNER JOIN users
            ON student_fees.user_id = users.id
        ORDER BY student_fees.created_at DESC
    `;


    db.query(
        sql,

        (err, results) => {

            if (err) {

                console.error(
                    "Admin fee records error:",
                    err
                );

                return res.status(500).json({

                    message:
                        "Failed to load fee records."

                });

            }


            res.status(200).json(results);

        }
    );

});


// =====================================================
// STUDENT - GET MY FEE DETAILS
// =====================================================

app.get("/api/fees/:userId", (req, res) => {

    const userId =
        req.params.userId;


    const sql = `
        SELECT
            users.name,
            users.department,
            users.section,
            users.user_id,
            users.student_type,

            student_fees.course_fee,
            student_fees.hostel_fee,
            student_fees.total_amount,
            student_fees.paid_amount,
            student_fees.remaining_amount,
            student_fees.payment_status,
            student_fees.last_payment_date

        FROM student_fees

        INNER JOIN users
            ON student_fees.user_id = users.id

        WHERE student_fees.user_id = ?
    `;


    db.query(
        sql,
        [userId],

        (err, results) => {

            if (err) {

                console.error(
                    "Student fee error:",
                    err
                );

                return res.status(500).json({

                    message:
                        "Failed to load fee details."

                });

            }


            if (results.length === 0) {

                return res.status(404).json({

                    message:
                        "No fee details found."

                });

            }


            res.status(200).json(
                results[0]
            );

        }
    );

});


// =====================================================
// STUDENT - MAKE FEE PAYMENT
// =====================================================

app.post("/api/fees/pay", (req, res) => {

    const {
        name,
        regdNo,
        phone,
        email,
        course,
        branch,
        feeType,
        amount,
        date,
        paymentMethod,
        transactionId
    } = req.body;


    if (
        !name ||
        !regdNo ||
        !phone ||
        !email ||
        !course ||
        !branch ||
        !feeType ||
        !amount ||
        !date ||
        !paymentMethod ||
        !transactionId
    ) {

        return res.status(400).json({
            message:
                "Please provide all payment details."
        });

    }


    const paymentAmount =
        Number(amount);


    if (paymentAmount <= 0) {

        return res.status(400).json({
            message:
                "Invalid payment amount."
        });

    }


    const studentSql = `
        SELECT id
        FROM users
        WHERE user_id = ?
        AND role = 'student'
    `;


    db.query(
        studentSql,
        [regdNo],

        (err, studentResult) => {

            if (err) {

                console.error(
                    "Find student error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to find student."
                });

            }


            if (studentResult.length === 0) {

                return res.status(404).json({
                    message:
                        "Student registration number not found."
                });

            }


            const userId =
                studentResult[0].id;


            const feeSql = `
                SELECT
                    course_fee,
                    hostel_fee,
                    paid_amount,
                    remaining_amount
                FROM student_fees
                WHERE user_id = ?
            `;


            db.query(
                feeSql,
                [userId],

                (err, feeResult) => {

                    if (err) {

                        console.error(
                            "Fee check error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check student fee."
                        });

                    }


                    if (feeResult.length === 0) {

                        return res.status(404).json({
                            message:
                                "No fee has been assigned by the administration."
                        });

                    }


                    const fee =
                        feeResult[0];


                    let assignedAmount =
                        0;


                    if (
                        feeType === "Course Fee"
                    ) {

                        assignedAmount =
                            Number(fee.course_fee);

                    }

                    else if (
                        feeType === "Hostel Fee"
                    ) {

                        assignedAmount =
                            Number(fee.hostel_fee);

                    }

                    else {

                        return res.status(400).json({
                            message:
                                "Invalid fee type."
                        });

                    }


                    if (
                        paymentAmount >
                        assignedAmount
                    ) {

                        return res.status(400).json({
                            message:
                                "Payment amount cannot be greater than the assigned fee."
                        });

                    }


                    if (
                        paymentAmount >
                        Number(fee.remaining_amount)
                    ) {

                        return res.status(400).json({
                            message:
                                "Payment amount cannot be greater than the remaining fee."
                        });

                    }


                    const insertSql = `
                        INSERT INTO fee_payments
                        (
                            user_id,
                            fee_type,
                            amount,
                            payment_date,
                            transaction_id,
                            payment_method,
                            name,
                            registration_no,
                            phone,
                            email,
                            course,
                            branch
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;


                    db.query(
                        insertSql,

                        [
                            userId,
                            feeType,
                            paymentAmount,
                            date,
                            transactionId,
                            paymentMethod,
                            name,
                            regdNo,
                            phone,
                            email,
                            course,
                            branch
                        ],

                        (err) => {

                            if (err) {

                                console.error(
                                    "Payment insert error:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to record payment."
                                });

                            }


                            const newPaidAmount =
                                Number(fee.paid_amount) +
                                paymentAmount;


                            const newRemainingAmount =
                                Number(fee.remaining_amount) -
                                paymentAmount;


                            let paymentStatus =
                                "Pending";


                            if (
                                newRemainingAmount <= 0
                            ) {

                                paymentStatus =
                                    "Paid";

                            }

                            else if (
                                newPaidAmount > 0
                            ) {

                                paymentStatus =
                                    "Partially Paid";

                            }


                            const updateFeeSql = `
                                UPDATE student_fees
                                SET
                                    paid_amount = ?,
                                    remaining_amount = ?,
                                    payment_status = ?,
                                    last_payment_date = ?
                                WHERE user_id = ?
                            `;


                            db.query(
                                updateFeeSql,

                                [
                                    newPaidAmount,
                                    newRemainingAmount,
                                    paymentStatus,
                                    date,
                                    userId
                                ],

                                (err) => {

                                    if (err) {

                                        console.error(
                                            "Fee update error:",
                                            err
                                        );

                                        return res.status(500).json({
                                            message:
                                                "Payment recorded but fee balance update failed."
                                        });

                                    }


                                    res.status(200).json({

                                        message:
                                            "Payment recorded successfully.",

                                        transactionId:
                                            transactionId,

                                        amount:
                                            paymentAmount,

                                        paymentStatus:
                                            paymentStatus,

                                        remainingAmount:
                                            newRemainingAmount

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


// =====================================================
// FACULTY STUDENTS
// =====================================================

app.get("/api/faculty/students/:facultyUserId", (req, res) => {

    const facultyUserId =
        req.params.facultyUserId;


    const facultySql = `
        SELECT
            department,
            section
        FROM users
        WHERE id = ?
        AND role = 'faculty'
    `;


    db.query(
        facultySql,
        [facultyUserId],

        (err, facultyResults) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Database error."
                });

            }


            if (facultyResults.length === 0) {

                return res.status(404).json({
                    message:
                        "Faculty not found."
                });

            }


            const faculty =
                facultyResults[0];


            const studentSql = `
                SELECT
                    id,
                    name,
                    email,
                    user_id,
                    department,
                    section
                FROM users
                WHERE role = 'student'
                AND department = ?
                AND section = ?
                ORDER BY name
            `;


            db.query(
                studentSql,

                [
                    faculty.department,
                    faculty.section
                ],

                (studentErr, students) => {

                    if (studentErr) {

                        console.error(
                            studentErr
                        );

                        return res.status(500).json({
                            message:
                                "Failed to load students."
                        });

                    }


                    res.status(200).json({

                        students:
                            students

                    });

                }
            );

        }
    );

});


// =====================================================
// FACULTY ATTENDANCE - SAVE
// =====================================================

app.post("/api/faculty/attendance", (req, res) => {

    const {
        facultyUserId,
        subject,
        section,
        attendanceDate,
        students
    } = req.body;


    if (
        !facultyUserId ||
        !subject ||
        !section ||
        !attendanceDate ||
        !students ||
        !Array.isArray(students)
    ) {

        return res.status(400).json({
            message:
                "Invalid attendance data."
        });

    }


    if (students.length === 0) {

        return res.status(400).json({
            message:
                "No students found."
        });

    }


    const sql = `
        INSERT INTO faculty_attendance
        (
            faculty_user_id,
            student_user_id,
            subject,
            section,
            attendance_date,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            status = VALUES(status)
    `;


    let completed =
        0;


    let hasError =
        false;


    students.forEach(
        student => {

            db.query(
                sql,

                [
                    facultyUserId,
                    student.studentUserId,
                    subject,
                    section,
                    attendanceDate,
                    student.status
                ],

                (err) => {

                    if (hasError) {
                        return;
                    }


                    if (err) {

                        hasError =
                            true;

                        console.error(
                            "Attendance save error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to save attendance."
                        });

                    }


                    completed++;


                    if (
                        completed ===
                        students.length
                    ) {

                        res.status(200).json({
                            message:
                                "Attendance saved successfully."
                        });

                    }

                }
            );

        }
    );

});


// =====================================================
// FACULTY ATTENDANCE - GET
// =====================================================

app.get("/api/faculty/attendance/:facultyUserId", (req, res) => {

    const facultyUserId =
        req.params.facultyUserId;


    const sql = `
        SELECT
            fa.id,
            fa.student_user_id,
            u.name,
            u.user_id,
            fa.subject,
            fa.section,
            fa.attendance_date,
            fa.status
        FROM faculty_attendance fa
        JOIN users u
            ON fa.student_user_id = u.id
        WHERE fa.faculty_user_id = ?
        ORDER BY fa.attendance_date DESC
    `;


    db.query(
        sql,
        [facultyUserId],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to load attendance."
                });

            }


            res.status(200).json({

                attendance:
                    results

            });

        }
    );

});


// =====================================================
// FACULTY ASSIGNMENTS - CREATE
// =====================================================

app.post("/api/faculty/assignments", (req, res) => {

    const {
        facultyUserId,
        title,
        subject,
        section,
        dueDate,
        description
    } = req.body;


    if (
        !facultyUserId ||
        !title ||
        !subject ||
        !section ||
        !dueDate
    ) {

        return res.status(400).json({
            message:
                "Please fill all required assignment fields."
        });

    }


    const sql = `
        INSERT INTO faculty_assignments
        (
            faculty_user_id,
            title,
            subject,
            section,
            due_date,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,

        [
            facultyUserId,
            title,
            subject,
            section,
            dueDate,
            description || ""
        ],

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to create assignment."
                });

            }


            res.status(201).json({

                message:
                    "Assignment created successfully.",

                assignmentId:
                    result.insertId

            });

        }
    );

});


// =====================================================
// FACULTY ASSIGNMENTS - GET
// =====================================================

app.get("/api/faculty/assignments/:facultyUserId", (req, res) => {

    const facultyUserId =
        req.params.facultyUserId;


    const sql = `
        SELECT
            id,
            title,
            subject,
            section,
            due_date,
            description,
            created_at
        FROM faculty_assignments
        WHERE faculty_user_id = ?
        ORDER BY due_date ASC
    `;


    db.query(
        sql,
        [facultyUserId],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to load assignments."
                });

            }


            res.status(200).json({

                assignments:
                    results

            });

        }
    );

});


// =====================================================
// FACULTY ASSIGNMENTS - DELETE
// =====================================================

app.delete("/api/faculty/assignments/:id", (req, res) => {

    const assignmentId =
        req.params.id;


    const sql = `
        DELETE FROM faculty_assignments
        WHERE id = ?
    `;


    db.query(
        sql,
        [assignmentId],

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to delete assignment."
                });

            }


            res.status(200).json({

                message:
                    "Assignment deleted successfully."

            });

        }
    );

});


// =====================================================
// FACULTY REQUESTS - GET
// =====================================================

app.get("/api/faculty/requests/:facultyUserId", (req, res) => {

    const facultyUserId =
        req.params.facultyUserId;


    const sql = `
        SELECT
            fr.id,
            fr.request_type,
            fr.subject,
            fr.message,
            fr.request_date,
            fr.status,
            u.name AS student_name,
            u.user_id AS student_id
        FROM faculty_requests fr
        JOIN users u
            ON fr.student_user_id = u.id
        WHERE fr.faculty_user_id = ?
        ORDER BY fr.request_date DESC
    `;


    db.query(
        sql,
        [facultyUserId],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to load faculty requests."
                });

            }


            res.status(200).json({

                requests:
                    results

            });

        }
    );

});


// =====================================================
// FACULTY REQUESTS - UPDATE STATUS
// =====================================================

app.put("/api/faculty/requests/:id/status", (req, res) => {

    const requestId =
        req.params.id;


    const {
        status
    } = req.body;


    if (
        ![
            "Pending",
            "Approved",
            "Rejected"
        ].includes(status)
    ) {

        return res.status(400).json({
            message:
                "Invalid request status."
        });

    }


    const sql = `
        UPDATE faculty_requests
        SET status = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [status, requestId],

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to update request."
                });

            }


            res.status(200).json({

                message:
                    "Request status updated successfully."

            });

        }
    );

});


// =====================================================
// FACULTY NOTICES - CREATE
// =====================================================

app.post("/api/faculty/notices", (req, res) => {

    const {
        facultyUserId,
        title,
        category,
        audience,
        noticeDate,
        message
    } = req.body;


    if (
        !facultyUserId ||
        !title ||
        !category ||
        !audience ||
        !noticeDate ||
        !message
    ) {

        return res.status(400).json({
            message:
                "Please fill all notice fields."
        });

    }


    const sql = `
        INSERT INTO faculty_notices
        (
            faculty_user_id,
            title,
            category,
            audience,
            notice_date,
            message
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,

        [
            facultyUserId,
            title,
            category,
            audience,
            noticeDate,
            message
        ],

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to create notice."
                });

            }


            res.status(201).json({

                message:
                    "Notice posted successfully.",

                noticeId:
                    result.insertId

            });

        }
    );

});


// =====================================================
// FACULTY NOTICES - GET
// =====================================================

app.get("/api/faculty/notices/:facultyUserId", (req, res) => {

    const facultyUserId =
        req.params.facultyUserId;


    const sql = `
        SELECT
            id,
            title,
            category,
            audience,
            notice_date,
            message,
            created_at
        FROM faculty_notices
        WHERE faculty_user_id = ?
        ORDER BY notice_date DESC, id DESC
    `;


    db.query(
        sql,
        [facultyUserId],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to load notices."
                });

            }


            res.status(200).json({

                notices:
                    results

            });

        }
    );

});


// =====================================================
// FACULTY NOTICES - DELETE
// =====================================================

app.delete("/api/faculty/notices/:id", (req, res) => {

    const noticeId =
        req.params.id;


    const sql = `
        DELETE FROM faculty_notices
        WHERE id = ?
    `;


    db.query(
        sql,
        [noticeId],

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to delete notice."
                });

            }


            res.status(200).json({

                message:
                    "Notice deleted successfully."

            });

        }
    );

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        `CampusEase server running on port ${PORT}`
    );

});