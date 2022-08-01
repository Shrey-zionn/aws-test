const express = require('express');
require('dotenv/config');
const cors = require('cors');
const newsRouter = require('./router/getNews');
const db = require('./config/db')
const authRouter = require('./router/auth');


const app = express();
app.use(express.json());
app.use(cors())


app.use("/auth", authRouter)
app.use("/getnews", newsRouter)
app.use((req,res)=>{
    res.json({
        message : "Page not found"
    })
})

app.listen(process.env.PORT || 8080, () => {
    console.log(`Server running`)
})