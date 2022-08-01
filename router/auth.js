const express = require('express');
const jwt = require('jsonwebtoken')
const db = require('../config/db')
const {
    v4: uuidv4
} = require('uuid');
const {
    JWT_KEY
} = process.env
const otpGenerator = require('otp-generator');
const sendMail = require('../helper/sendMail');


const authRouter = express.Router()


authRouter.route("/login").post(loginUser)
authRouter.route("/signup").post(signUpUser)
authRouter.route("/otpverify").post(otpVerify)




async function loginUser(req, res) {
    try {

        let userObj = req.body;
        let user_email = userObj.email
        let password = userObj.password

        let sql = `SELECT * FROM user_details WHERE email='${user_email}'`

        if (password === null) {
            console.log("You are already logged in through some socials");
        }

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            } else {

                if (result[0].password === null) {
                    console.log("You are already logged in through some other socials");
                } else {

                    if (password !== result[0].password) {
                        res.json({
                            message: "Wrong password or email",
                        })
                    } else if (result[0].otp_verify === 0) {

                        // OTP REQUEST FROM FRONTEND
                        res.json({
                            message: "Account not verified",
                        })
                    } else {

                        // login the user

                        let payload = user_email;
                        const token = jwt.sign({
                            id: payload
                        }, JWT_KEY)

                        res.json({
                            message: "User logged up",
                            token: token
                        })

                    }

                }

            }
        })

    } catch (error) {

        res.json({
            message: error.message
        })
    }
}

async function signUpUser(req, res) {
    try {

        let userObj = req.body;

        let uuid = uuidv4()
        let user_name = userObj.name
        let email = userObj.email
        let password = userObj.password
        let phone = userObj.phone

        let cql = `SELECT * FROM user_details WHERE email='${email}'`

        db.query(cql, (err, result) => {
            if (err) {
                throw err
            } else {

                // if user with email is not present
                if (result.length == 0) {
                    let otp = otpGenerator.generate(6, {
                        upperCaseAlphabets: false,
                        specialChars: false
                    });

                    sendMail(email, otp)

                    let sql = `INSERT INTO user_details (u_id,user_name,email,password,phone,otp,otp_verify) VALUES ('${uuid}','${user_name}','${email}','${password}','${phone}','${otp}',FALSE)`

                    let payload = email;
                    const token = jwt.sign({
                        id: payload
                    }, JWT_KEY)

                    db.query(sql, (err, result) => {
                        if (err) {
                            throw err
                        }
                    })
                    res.json({
                        message: "User Signed up",
                        token: token
                    })
                } 
                
                // if user has not verified otp
                else if (result[0] ?.otp_verify === 0) {
                    console.log("user exits");
                    res.json({
                        message: "User already exit"
                    })
                }
            }
        })





    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}

async function otpVerify(req, res) {
    try {

        let otp = req.body.otp;
        let email = req.body.email;

        let sql = `SELECT * FROM user_details WHERE email='${email}' AND otp='${otp}'`

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            } else {
                if (result.length == 0) {
                    res.json({
                        message: "otp did not match"
                    })
                } else {

                    let uql = `UPDATE user_details SET otp_verify = TRUE WHERE email='${email}' `
                    db.query(uql, (err, result) => {
                        if (err) {
                            throw err
                        }
                    })
                    res.json({
                        message: "otp verified"
                    })
                }
            }
        })

    } catch (error) {

    }
}



module.exports = authRouter;