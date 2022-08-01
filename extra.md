passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(session({
    secret: "SESSION_SECRET"
}));
app.use(passport.initialize());
app.use(passport.session());

/******************* LINKEDLIN AND GOOGLE OBJECTS ****************/

passport.use(
    new LinkedInStrategy({
            clientID: process.env.LI_CID,
            clientSecret: process.env.LI_CS,
            callbackURL: "http://127.0.0.1:8080/auth/linkedin/callback",
            scope: ["r_emailaddress", "r_liteprofile"],
        },
        (
            accessToken,
            refreshToken,
            profile,
            done
        ) => {
            process.nextTick(() => {
                return done(null, profile);
            });
        }
    )
);

passport.use(
    new GoogleStrategy({
            clientID: process.env.G_CID,
            clientSecret: process.env.G_CS,
            callbackURL: 'http://localhost:8080/auth/google/redirect'
        },
        (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
                return done(null, profile);
            });
        })
);

/***********************************************************/

// Linkedln routes
app.get(
    "/auth/linkedin",
    passport.authenticate("linkedin", {
        state: "SOME STATE"
    })
);
app.get(
    "/auth/linkedin/callback",
    passport.authenticate("linkedin", {
        successRedirect: "/",
        failureRedirect: "/fail",
    })
);

// Google routes
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));
app.get('/auth/google/redirect', passport.authenticate('google', {
    successRedirect: "/",
    failureRedirect: "/fail",
}))


app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect("/")
})


// home route
app.get("/", (req, res) => {

    if (req.user) {
        const uid = req.user.id
        const name = req.user.name.givenName;
        const family = req.user.name.familyName;
        const photo = req.user.photos[0]?.value;
        const email = req.user.emails[0]?.value;

        // // check if user already exists 

        // let cql = `SELECT email FROM user_details WHERE email='${email}'`

        // db.query(cql, (err, result) => {
        //     if(result.length===0){
        //         let sql = `INSERT INTO user_details (u_id,user_name , email,photo_url) VALUES ('${uid}','${name}','${email}','${photo}')`

        //         db.query(sql, (err, result) => {
        //             if (err) {
        //                 throw err
        //             } else {
        //                 console.log(result);
        //             }
        //         })
        //     }else{

        //         console.log("USER ALREADY EXISTS");
        //     }
        // })

        

        res.send(
            `<center style="font-size:140%"> <p>User is Logged In </p>
        <p>Name: ${name} ${family} </p>
        <p> Email: ${email} </p>
        <img src="${photo}"/>
        </center>
        `
        )
    } else {
        res.send(`<center style="font-size:160%"> <p>This is Home Page </p>
      <p>User is not Logged In</p>
      <img style="cursor:pointer;"  onclick="window.location='/auth/linkedIn'" src="http://www.bkpandey.com/wp-content/uploads/2017/09/linkedinlogin.png"/>
      <img style="cursor:pointer;"  onclick="window.location='/auth/google'" src="http://www.bkpandey.com/wp-content/uploads/2017/09/googlelogin.png"/>
      </center>
      `);
    }
});