const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Aurosmita224",
    database: "campusease"
});

db.connect((err) => {

    if (err) {
        console.log("MySQL Connection Failed:", err.message);
        return;
    }

    console.log("MySQL Connected Successfully");

});

module.exports = db;