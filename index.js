const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");
const { requireLoggedOutUser, requireLoggedInUser } = require("./middleware");

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

////////////////////   register routes  ////////////////////

app.get("/register", requireLoggedOutUser, (req, res) => {
    console.log("req id is: ", req.session.id);
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then((hash) => {
            db.addToDb(first, last, email, hash)
                .then((dbEntry) => {
                    console.log("entry added to DB");
                    req.session.id = dbEntry.rows[0].id;
                    res.redirect("/profile");
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

app.get("/profile", requireLoggedInUser, (req, res) => {
    console.log("profile id: ", req.session.id);
    if (req.session.id) {
        res.render("profile", {
            layout: "main",
            loggedIn: true,
        });
    }
});

app.post("/profile", requireLoggedInUser, (req, res) => {
    const { age, city, url } = req.body;
    console.log(req.body);
    if (url.startsWith("https://") || url.startsWith("http://") || url == ``) {
        db.addProfile(
            age,
            city.toLowerCase(),
            url.toLowerCase(),
            req.session.id
        )
            .then(() => {
                console.log("profile info added to db");
                res.redirect("/thanks");
                return;
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        console.log("url not valid");
        res.render("profile", {
            layout: "main",
            loggedIn: true,
        });
        return;
    }
});

////////////////////   edit routes  ///////////////////

app.get("/profile/edit", requireLoggedInUser, (req, res) => {
    console.log("profile id: ", req.session.id);
    console.log("profile edit route!!");
    db.editProfileInfo(req.session.id).then(({ rows }) => {
        // console.log("info: ", rows);
        res.render("edit", {
            layout: "main",
            rows,
            loggedIn: true,
        });
    });
});

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
    const { first, last, email, password, age, city, url } = req.body;
    // console.log(first, last);
    if (password) {
        console.log("new pass submitted");
        hash(password)
            .then((hash) => {
                if (
                    url.startsWith("https://") ||
                    url.startsWith("http://") ||
                    url == ``
                ) {
                    console.log("url acceptable");
                    db.updateUser(first, last, email, hash, req.session.id)
                        .then(() => {
                            console.log("user updated");
                            console.log(
                                "id from update prof: ",
                                req.session.id
                            );
                            db.updateUserProfile(
                                age,
                                city.toLowerCase(),
                                url.toLowerCase(),
                                req.session.id
                            )
                                .then(() => {
                                    console.log("profile updated");
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                            res.redirect("/thanks");
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                } else {
                    console.log("url not acceptable");
                }
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        console.log("no pass submitted");
        db.updateUserNoPw(first, last, email, req.session.id)
            .then(() => {
                console.log("user updated without new password");
                db.updateUserProfile(age, city, url, req.session.id)
                    .then(() => {
                        console.log("profile updated");
                        res.redirect("/thanks");
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    }
});

////////////////////   login routes  ////////////////////

app.get("/login", requireLoggedOutUser, (req, res) => {
    console.log("req sign id is: ", req.session.signed);
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
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

app.get("/petition", requireLoggedInUser, (req, res) => {
    console.log("is signed: : ", req.session.signed);
    if (req.session.signed) {
        console.log("redirected as user has signed");
        res.redirect("/thanks");
        return;
    } else {
        res.render("petition", {
            layout: "main",
            loggedIn: true,
        });
    }
});

app.post("/petition", requireLoggedInUser, (req, res) => {
    const { signature } = req.body;
    db.addSig(signature, req.session.id)
        .then(() => {
            console.log("signature added to the db");
            req.session.signed = true;
            console.log("signed petition is : ", req.session.signed);
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error in db.addSig", err);
            res.redirect("/petition");
        });
});

////////////////////   thanks route  ///////////////////

app.get("/thanks", requireLoggedInUser, (req, res) => {
    console.log(
        "signed petition is at the get req for thanks : ",
        req.session.signed
    );
    if (req.session.signed && req.session.id) {
        db.numSigned()
            .then((num) => {
                num = num.rows[0].count;
                db.findById(req.session.id)
                    .then((rows) => {
                        console.log("hitting then in findbyid: ", rows);
                        const sigImg = rows.rows[0].signature;
                        res.render("thanks", {
                            layout: "main",
                            num,
                            sigImg,
                            loggedIn: true,
                        });
                    })
                    .catch((err) => {
                        console.log("error in find sig: ", err);
                    });
            })
            .catch((err) => {
                console.log("error in num signed: ", err);
            });
    } else {
        // console.log("req session id from /thanks query", req.session.id);
        console.log("redirect from /thanks");
        res.redirect("/petition");
        return;
    }
});

app.post("/thanks", requireLoggedInUser, (req, res) => {
    console.log("post req to remove sig received");
    console.log("signed true?: ", req.session.signed);
    db.removeSig(req.session.id)
        .then(() => {
            console.log("signature removed :(");
            req.session.signed = false;
            res.redirect("/petition");
            return;
        })
        .catch((err) => {
            console.log(err);
        });
});

////////////////////   signers route  ///////////////////

app.get("/signers", requireLoggedInUser, (req, res) => {
    if (!req.session.signed) {
        res.redirect("/petition");
    } else {
        db.allSigned()
            .then(({ rows }) => {
                // console.log("results var is: ", rows);
                res.render("signers", {
                    rows,
                    layout: "main",
                    loggedIn: true,
                });
            })
            .catch((err) => {
                console.log("error in db.getSig", err);
            });
    }
});

app.get("/signers/:city", requireLoggedInUser, (req, res) => {
    const { city } = req.params;
    db.findUsersByCity(city)
        .then(({ rows }) => {
            console.log("db entry: ", rows);
            // const{ rows } = rows.rows;
            // console.log("first: ", first, "age: ", age)
            res.render("signers", {
                layout: "main",
                rows,
                loggedIn: true,
                cityPage: true,
                city,
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

////////////////////   redirect route  ///////////////////

app.get("/", (req, res) => {
    if (req.session.id) {
        res.render("home", {
            layout: "main",
            loggedIn: true,
            homePage: true,
        });
    } else {
        res.render("home", {
            layout: "main",
            homePage: true,
        });
    }
});

////////////////////   logout route  ///////////////////

app.get("/logout", requireLoggedInUser, (req, res) => {
    req.session.id = null;
    console.log(req.session);
    res.render("home", {
        layout: "main",
        homePage: true,
    });
});

app.listen(process.env.PORT || 8080, () => console.log("Server Listening!"));
