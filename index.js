const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db.js");
const cookieParser = require("cookie-parser");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(cookieParser());
app.use(express.static("./public"));

app.use((req, res, next) => {
    console.log("-----------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("-----------------");
    next();
});

app.get("/petition", (req, res) => {
    if (req.cookies.signed == "true") {
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
    console.log(req.params.first);
    db.addSig("Jiminy", "Cricket", "madeupSig")
        .then(() => {
            console.log("yay it worked");
            res.cookie("signed", "true");
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
    if (req.cookies.signed != "true") {
        res.redirect("/petition");
        return;
    } else {
        res.render("thanks", {
            layout: "main",
        });
    }
});

// //////from class submitting a db query
app.get("/signers", (req, res) => {
    if (req.cookies.signed != "true") {
        res.redirect("/petition");
    } else {
        res.render("signers", {
            layout: "main",
        });
        db.getSig()
            .then((result) => {
                console.log("result from getSig", result.rows);
            })
            .catch((err) => {
                console.log("error in db.getSig", err);
            });
    }
});

app.listen(8080, () => console.log("petition server running on port 8080"));
