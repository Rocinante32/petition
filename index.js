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

////////////////////   register routes  ////////////////////

app.get("/register", (req, res) => {
    console.log("req id is: ", req.session.id);
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then((hash) => {
            db.addToDb(first, last, email, hash)
                .then((dbEntry) => {
                    console.log("entry added to DB");
                    req.session.id = dbEntry.rows[0].id;
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
            res.redirect("/profile");
        })
        .catch((err) => {
            console.log("error in hash POST /register", err);
            let submitErr = true;
            res.render("register", {
                layout: "main",
                submitErr,
            });
        });
});

////////////////////   profile routes  ///////////////////

app.get("/profile", (req, res) => {
    console.log("profile signId: ", req.session.id);
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    const { age, city, url } = req.body;
    console.log(req.body);
    if (url.includes("https://") || url.includes("http://") || url ==``) {
        db.addProfile(age, city, url, req.session.id)
            .then(() => {
                console.log("profile info added to db");
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        console.log("url not valid");
        res.render("profile", {
            layout: "main",
        });
        return
    }
    res.redirect("/thanks");
});

////////////////////   login routes  ////////////////////

app.get("/login", (req, res) => {
    console.log("req sign id is: ", req.session.signId);
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.findByEmail(email)
        .then((dbEntry) => {
            compare(password, dbEntry.rows[0].password).then((result) => {
                if (result) {
                    req.session.id = dbEntry.rows[0].id;
                    console.log("req id is: ", req.session.id);
                    res.redirect("/thanks");
                } else {
                    res.render("login", {
                        layout: "main",
                        error: true,
                    });
                }
            });
        })
        .catch((err) => {
            console.log("error in compare POST /login", err);
            res.render("login", {
                layout: "main",
                error: true,
            });
        });
});

////////////////////   petition routes  ///////////////////

app.get("/petition", (req, res) => {
    console.log("req id var: ", req.session.id);
    if (req.session.signId) {
        console.log("redirected as user has signed");
        res.redirect("/thanks");
        return;
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    db.addSig(signature, req.session.id)
        .then((dbEntry) => {
            console.log("signature added to the db");
            req.session.signId = dbEntry.rows[0].id;
            console.log("sign id: ", req.session.signId);
            return;
        })
        .catch((err) => {
            console.log("error in db.addSig", err);
            res.redirect("/petition");
        });
    res.redirect("/thanks");
});

////////////////////   thanks route  ///////////////////

app.get("/thanks", (req, res) => {
    if (!req.session.signId) {
        console.log("redirect from /thanks");
        res.redirect("/petition");
        return;
    } else {
        // console.log("req session id from /thanks query", req.session.id);
        db.numSigned()
            .then((num) => {
                num = num.rows[0].count;
                db.findById(req.session.signId).then((rows) => {
                    const sigImg = rows.rows[0].signature;
                    res.render("thanks", {
                        layout: "main",
                        num,
                        sigImg,
                    });
                });
            })
            .catch((err) => {
                console.log("error in num signed: ", err);
            });
    }
});

////////////////////   signers route  ///////////////////

app.get("/signers", (req, res) => {
    if (typeof req.session.signId != "number") {
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

app.get("/signers/:city", (req, res) => {
    const { city } = req.params;
    db.findUsersByCity(city).then(({rows}) => {
        console.log("db entry: ", rows)
        // const{ rows } = rows.rows;
        // console.log("first: ", first, "age: ", age)
        res.render("signers", {
        layout: "main",
        rows
    });
    }).catch((err) => {
        console.log(err)
    })
});


////////////////////   redirect route  ///////////////////

app.get("/", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.listen(process.env.PORT || 8080, () => console.log("Server Listening!"));
