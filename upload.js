const {
    default: axios
} = require('axios');
const multer = require('multer')
const express = require('express');
require('dotenv/config');
const db = require('./config/db')
const uuid = require("uuid").v4
const app = express();
const fs = require('fs');
const {
    s3Uploadv2
} = require('./config/s3service');

app.use(express.json());


/************************MULTER CONFIG*************************8*/
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true)
    } else {
        cb(new Error("File type not supported"), false)
    }
}

const upload = multer({
    storage,
    fileFilter

})

/*********************************************************/

const uploadRouter = express.Router()
uploadRouter.route("/getpdf").get(getPdf)
uploadRouter.route("/upload").post( upload.single("file"),uploadReport)


async function uploadReport(req, res)  {
    const data = await s3Uploadv2(req.file)
    
    let sql = `UPDATE company_details SET report_url = '${data.Location}' WHERE c_name = "Godrej"`

    db.query(sql,(err,result)=>{
        if(err){
            res.json({
                message : err.message
            })
        }else{
            res.json({
                status: "success",
                data
            })
        }
    })

    
}

async function getPdf(req, res){
    try {

        let cin = "L74120MH1985PLC035308"
        let {
            data: pdf
        } = await axios.get(`https://api.probe42.in/probe_reports_sandbox/companies/${cin}/reports?type=pdf&client_name=probe`, {
            headers: {
                'x-api-key': "4PhvHuezjbttMU469pgl9iuNQIZ6Ntd7a3hWtFs4",
                'x-api-version': '1.3',
                'Accept': 'application/octet-stream',
                'Content-Type': 'application/pdf',
            },
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        })

        let bdata = Buffer.from(pdf).toString("base64");
        let buff = new Buffer(bdata, 'base64')
        fs.writeFileSync(`uploads/${cin}.pdf`, buff)
        res.send({
            message: 'done!!!'
        })

    } catch (error) {
        res.json({
            message: error.message
        })
    }
}



// Multer error handling
app.use((error, req, res, next) => {

    if (error) {

        return res.json({
            message: error.message
        })

    }

    next()
})


module.exports = uploadRouter