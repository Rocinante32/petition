const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db.js");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use((req, res, next) => {
    console.log("-----------------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    console.log("-----------------");
    next();
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        //if layout file is called main then you can leave layout as blank
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    res.render("petition", {
        //if layout file is called main then you can leave layout as blank
        layout: "main",
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        //if layout file is called main then you can leave layout as blank
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    res.render("signers", {
        //if layout file is called main then you can leave layout as blank
        layout: "main",
    });
});

// //////from class submitting a db query
// app.get("/actors", (req, res) => {
//     db.getActors()
//         .then((result) => {
//             console.log("result from getActors", result.rows);
//             res.sendStatus(200);
//         })
//         .catch((err) => {
//             console.log("error in db.getActors", err);
//         });
// });

app.listen(8080, () => console.log("petition server running on port 8080"));
