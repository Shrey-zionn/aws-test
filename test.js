const {
    default: axios
} = require('axios');
const express = require('express');
require('dotenv/config');
const app = express();
app.use(express.json());

const fs = require('fs')
const PDFDocument = require('pdfkit');
const base64 = require('base64topdf')



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
        let buff = new Buffer(bdata,'base64')
        fs.writeFileSync('some.pdf',buff)

        // how to save in db


        res.send({
            message:'done!!!'
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