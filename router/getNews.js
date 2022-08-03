const express = require('express')
const {
    v4: uuidv4
} = require('uuid');
const axios = require('axios').default;
const mysql = require('mysql');
const db = require('../config/db')
const NAPI_KEY = process.env.NAPI_KEY

const newsRouter = express.Router()

newsRouter.route("/add").get(addNews)
newsRouter.route("/get").get(getNews)



// allowed news reports
const whilelist = new Set();

whilelist.add("Business Today");
whilelist.add("The Times of India");
whilelist.add("Business Today");
whilelist.add("Business Standard");
whilelist.add("Business Standard");
whilelist.add("Livemint");
whilelist.add("Daily Mail");
whilelist.add("ValueWalk");


async function addNews(req, res) {

    try {
        let company = req.query.q;
        let ccid = uuidv4()

        let news = await axios.get(`https://newsapi.org/v2/everything?q=${company}&pageSize=5&language=en&sortBy=publishedAt&apiKey=${NAPI_KEY}`)

        news.data.articles.forEach(news => {
            delete news.author;
        });
        // INSERT COMPANY IF IT DOES NOT EXISTS
        let sql = `INSERT INTO company_details (c_id , c_name) VALUES ('${ccid}','${company}')`
        db.query(sql, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result);
            }
        })

        // ADDING NEW NEWS LETTER
        news.data.articles.forEach(news => {
            if (whilelist.has(news.source.name)) {
                let c_id = ccid;

                let news_title = news.title.replace("'", "\\")
                let news_url = news.url.replace("'", "\\")
                let publishedAt = news.publishedAt
                let news_content = news.content.replace("'", "\\")


                // let nql = `INSERT INTO news_details (news_title,news_url,publishedAt,news_content,c_id) VALUES ('${news_title}','${news_url}','${publishedAt}','${news_content}','${c_id}')`
                let nql = `INSERT INTO news_updates (new_title,new_url,publishedAt,news_content,c_id) VALUES ('${news_title}','${news_url}','${publishedAt}','${news_content}','${c_id}')`
                db.query(nql, (err, result) => {
                    if (err) {
                        throw err
                    } else {
                        console.log(result);
                    }
                })
            }
        });

        res.json({
            news: news.data.articles
        })

    } catch (error) {
        res.json({
            message: error.message
        })
    }
}

async function getNews(req, res) {
    try {
        let company = req.query.q;

        console.log(req.query);

        // let sql = `SELECT * FROM news_details LEFT JOIN company_details ON news_details.c_id = company_details.c_id WHERE c_name='${company}' `
        let sql = `SELECT * FROM news_updates LEFT JOIN company_details ON news_updates.c_id = company_details.c_id WHERE c_name='${company}' `



        db.query(sql, (err, result) => {
            if (err) {
                throw err
            } else {
                console.log(result);
                res.json({
                    news_details: result
                })
            }
        })


    } catch (error) {
        res.json({
            message: error.message
        })
    }
}



module.exports = newsRouter;