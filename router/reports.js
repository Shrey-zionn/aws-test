const express = require('express');
const {
    v4: uuidv4
} = require('uuid');
const {
    default: axios
} = require('axios');
const db = require('../config/db')

const reportRouter = express.Router()

reportRouter.route("/addreport").post(addCompanyReport)
reportRouter.route("/getreport").get(getCompanyReport)
reportRouter.route("/getUpdate").get(updateReport)

async function addCompanyReport(req, res) {
    try {

        let company = 'VISMAYAS'
        let cin = 'U92140KL2015PTC038339'

        let sql = `SELECT * from company_details WHERE c_name = '${company}'`

        db.query(sql, async (err, result) => {

            if (err) {
                res.json({
                    message : err.message
                })
                
            } else {

                // company does not exists
                if (result.length == 0) {

                    let c_id = uuidv4();
                    let date = Date.now()
                    
                    let iql = `INSERT INTO company_details (c_id , c_name,date,cin) VALUES ('${c_id}' , '${company}','${date}','${cin}')`

                    db.query(iql,(err,result)=>{
                        if(err){
                            res.json({
                                message:err.message
                            })
                        }
                    })

                    let doc = await axios(`https://api.probe42.in/probe_pro_sandbox/companies/${cin}/comprehensive-details` ,{
                        headers: {
                            'x-api-key': "4PhvHuezjbttMU469pgl9iuNQIZ6Ntd7a3hWtFs4",
                            'x-api-version': '1.3',
                            'Accept': 'application/octet-stream',
                            'Content-Type': 'application/pdf',
                        }
                    })

                    for(let i=0;i<doc.data.data.peer_comparison.length;i++){
                        let biz_segment = doc.data.data.peer_comparison[i]?.bizSegment; 
                        for(let j=0;j<3;j++){
                            // all other details will be from benchmark
                            let ebitda_margin = doc.data.data.peer_comparison[i].benchMarks[j]?.ebitda_margin; 
                            let return_on_equity =  doc.data.data.peer_comparison[i].benchMarks[j]?.return_on_equity;
                            let  revenue = doc.data.data.peer_comparison[i].benchMarks[j]?.revenue
                            let revenue_growth = doc.data.data.peer_comparison[i].benchMarks[j]?.revenue_growth
                            let net_margin = doc.data.data.peer_comparison[i].benchMarks[j]?.net_margin
                            let year = doc.data.data.peer_comparison[i].benchMarks[j]?.year

                            let fql = `INSERT INTO company_reports (c_id , biz_segment ,year,ebitda_margin,return_on_equity,net_margin,revenue,revenue_growth) VALUES ('${c_id}','${biz_segment}','${year}','${net_margin}','${ebitda_margin}','${return_on_equity}','${revenue}','${revenue_growth}')`

                            db.query(fql,(err,result)=>{
                                if(err){
                                    res.json({
                                        message : err.message
                                    })
                                }
                            })
                        }
                    }

                    res.json({
                        message : "reports have been added"
                    })
  

                }else{
                    res.json({
                        message : "reports have already been added"
                    })
                }
            }
        })



    } catch (error) {
        res.json({
            message: error.message
        })
    }
}

async function getCompanyReport(req,res){
    try {

        // let company = req.body

        let sql = `SELECT * FROM company_reports LEFT JOIN company_details ON company_reports.c_id = company_details.c_id WHERE c_name="Godrej"`

        db.query(sql,(err,result)=>{
            if(err){
                res.json({
                    message : err.message
                })
            }else{
                res.json({
                    result
                })
            }
        })
        
    } catch (error) {
        res.json({
            message: error.message
        })
    }
}

async function updateReport(req,res){
    try {

         let cin= req.query.q;

         let doc = await axios.get(`https://api.probe42.in/probe_pro_sandbox/companies/${cin}/datastatus`,{
            headers: {
                'x-api-key': "4PhvHuezjbttMU469pgl9iuNQIZ6Ntd7a3hWtFs4",
                'x-api-version': '1.3',
            }
         })

        let update_date = doc.data.data.data_status.last_details_updated

        let date = new Date(update_date);

        let curr_time = date.getTime()
        let sql = `SELECT date FROM company_details WHERE cin='${cin}'`

        db.query(sql,(err,result)=>{
            if(err){
                res.json({
                   message: err.message
                })
            }else{
                let last_update = result[0].date
                
                let days_since_last_update = Math.ceil((last_update - curr_time)/(1000 * 3600 * 24))
                
                if(days_since_last_update>=120){
                    res.json({
                        message : "Data is outdated"
                    })
                }else{
                    res.json({
                        message : `Reports were last updated ${days_since_last_update}`
                    })
                }

                res.json({
                    message:"done"
                 })
            }
        })

         

        
    } catch (error) {
        res.json({
            message : error.message
        })
    }
}

module.exports =reportRouter