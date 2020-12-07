const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

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

app.post("/petition", (req, res) => {
    const { first, last, signature } = req.body;
    console.log("req.body log: ", req.body);
    console.log("sig var: ", signature);
    // console.log("first: ", first, " and last: ", last);
    db.addSig(first, last, signature)
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
