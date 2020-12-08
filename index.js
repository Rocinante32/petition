const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: `Even a bad pizza is a good pizza`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(csurf());

app.use(function (req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(express.static("./public"));

// app.use((req, res, next) => {
//     console.log("-----------------");
//     console.log(`${req.method} request coming in on route ${req.url}`);
//     console.log("-----------------");
//     next();
// });

app.get("/petition", (req, res) => {
    console.log("req id var: ", req.session.id);
    if (req.session.signed == "true") {
        console.log("redirected as user has signed");
        res.redirect("/thanks");
        return;
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    // console.log(first, last, email, password);
    hash(password)
        .then((hash) => {
            db.addToDb(first, last, email, hash)
                .then((dbEntry) => {
                    console.log("entry added to DB");
                    req.session.id = dbEntry.rows[0].id;
                    console.log("req id is: ", req.session.id);
                    console.log("hash in / register:", hash);
                    return;
                })
                .catch((err) => {
                    console.log("error in adding user to db: ", err);
                    let submitErr = true;
                    res.render("register", {
                        layout: "main",
                        submitErr,
                    });
                });
            res.redirect("/petition");
            // store the user's hashed pw and all the other user info in our database
            // if sth goes wrong with storing the user info in the database, rerender the register template with an error msg otherwise redirect to /petition
        })
        .catch((err) => {
            console.log("error in hash POST /register", err);
            let submitErr = true;
            res.render("register", {
                layout: "main",
                submitErr,
            });
            // if sth goes wrong, rerender the login with an error msg
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    console.log("email: ", email, "password: ", password);
    db.findByEmail(email)
        .then((dbEntry) => {
            console.log(dbEntry);
        })
        .then(() => {});
    // check if the email the user provided exists, and if so SELECT the user's stored hash from the db
    // once you have that info from the db only then call 'compare'
    // replace 'userInput' with the plainTxtPw user just provided in login!
    compare(password, hashFromDb)
        .then((result) => {
            // result will be either true or false depending on whether it's a match
            // if a match, set a cookie with the user's id,
            // if not a match, rerender the login template with an error msg
        })
        .catch((err) => {
            console.log("error in compare POST /login", err);
            // we need to rerender the login template with an error msg
        });
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    console.log("req.body log: ", req.body);
    console.log("req id var: ", req.session.id);
    // console.log("first: ", first, " and last: ", last);
    db.addSig(signature)
        .then((dbEntry) => {
            console.log("yay it worked");
            req.session.signed = "true";
            console.log("req.session after setting: ", req.session);
            req.session.id = dbEntry.rows[0].id;
            console.log("session id: ", req.session.id);
            res.redirect("/thanks");
            return;
        })
        .catch((err) => {
            console.log("error in db.addSig", err);
            res.redirect("/petition");
            alert("An error occured please try again");
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.signed != "true") {
        res.redirect("/petition");
        return;
    } else {
        console.log("req session id from /thanks query", req.session.id);
        db.numSigned()
            .then((num) => {
                num = num.rows[0].count;
                db.findById(req.session.id).then((rows) => {
                    // console.log("rows: ", rows.rows[0].signature);
                    const sigImg = rows.rows[0].signature;
                    res.render("thanks", {
                        layout: "main",
                        num,
                        sigImg,
                    });
                });
                // console.log(num);
            })
            .catch((err) => {
                console.log("error in num signed: ", err);
            });
    }
});

// //////from class submitting a db query
app.get("/signers", (req, res) => {
    if (req.session.signed != "true") {
        res.redirect("/petition");
    } else {
        db.allSigned()
            .then(({ rows }) => {
                // console.log("results var is: ", rows);
                res.render("signers", {
                    rows,
                    layout: "main",
                });
            })
            .catch((err) => {
                console.log("error in db.getSig", err);
            });
    }
});

app.listen(8080, () => console.log("petition server running on port 8080"));
