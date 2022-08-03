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
authRouter.route("/onboarding").post(onBoarding)




async function loginUser(req, res) {
    try {

        // console.log(req.body);
        let userObj = req.body;
        let user_email = userObj.email
        let password = userObj.password

        let sql = `SELECT * FROM user_details WHERE email='${user_email}'`


        db.query(sql, (err, result) => {
            if (err) {
                throw err
            } else {
                
                if (result[0].password == 'undefined') {
                    res.json({
                        message :"user logged in"
                    })
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
                    } else if(password === result[0].password) {

                        // login the user
                        
                        let payload = user_email;
                        const token = jwt.sign({
                            id: payload
                        }, JWT_KEY)

                        res.json({
                            message: "User logged up",
                            token: token
                        })

                    }else{
                        res.json({
                            message :"something went wrong"
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

async function onBoarding(req,res){
    try {
        
        
        let {email , curr_employer , designation , tenure} = req.body;

        let uql = `UPDATE user_details SET curr_employer = '${curr_employer}' , designation = '${designation}' , tenure = '${tenure}' WHERE email = '${email}'`

        db.query(uql,(err,result)=>{
            if(err){
                res.json({
                    message : err.message
                })
            }else{
                console.log(result);
                res.json({
                    message : "Details saved"
                })
            }
        })


    } catch (error) {
        res.json({
            error : error.message
        })
        
    }
}

module.exports = authRouter;