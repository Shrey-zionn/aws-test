const nodemailer = require('nodemailer');
let {
    NODEMAILER_API
} = process.env;


module.exports = async function sendMail(mailId, otp) {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587, 
        secure: false, 
        auth: {
            user: 'zionndev@zionn.trade', 
            pass: NODEMAILER_API, 
        },
    });

    

    let info = await transporter.sendMail({

        from: `zionndev@zionn.trade`,
        to: `${mailId}`,
        subject: `OTP VERIFICATION`,
        text: `${otp}`,
    });

    console.log("->", info.messageId)
}