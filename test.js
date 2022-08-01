const {
    default: axios
} = require('axios');
const multer = require('multer')
const express = require('express');
require('dotenv/config');
const uuid = require("uuid").v4
const app = express();
const fs = require('fs');
const {
    s3Uploadv2
} = require('./config/s3service');

app.use(express.json());



/*******************MULTER CONFIG********************/


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads")
//     },
//     filename: (req, file, cb) => {
//         const {
//             originalname
//         } = file;
//         cb(null, `${uuid()}-${originalname}`)
//     }

// })


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

app.post("/upload", upload.single("file"), async (req, res) => {
    console.log(req.file);
    const data = await s3Uploadv2(req.file)
    
    res.json({
        status: "success",
        data
    })
})


/*************************************************/

app.use((error, req, res, next) => {

    if (error) {

        return res.json({
            message: error.message
        })

    }

    next()
})


app.get("/", async (req, res) => {
    try {

        let {
            data: pdf
        } = await axios.get("https://api.probe42.in/probe_reports_sandbox/companies/L28920MH1945PLC004520/reports?type=pdf&client_name=probe", {
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
        fs.writeFileSync('some.pdf', buff)
        res.send({
            message: 'done!!!'
        })

    } catch (error) {
        res.json({
            message: error.message
        })
    }
})



app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running`)
})