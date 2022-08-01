const express = require('express');
require('dotenv/config');
const mysql = require('mysql')
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME
const DB_HOST  = process.env.DB_HOST

const db = mysql.createPool({
    host: DB_HOST,
    user: DB_NAME,
    password: DB_PASSWORD,
    port :'3306',
    database:'zionn_prod',
    multipleStatements: true
})

let select = `SELECT COUNT(*) AS count FROM ${mysql.escapeId('application.table')}`

db.query(select)

db.getConnection((err) => {
    if (err) {
        console.log(err.message);
        console.log("Connection failed");
    } else {
        console.log("Connection successfull");
    }
})

module.exports = db;