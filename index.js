const express = require("express");
const app = express();
const db = require("./db.js");

app.get("/actors", (req, res) => {
    db.getActors()
        .then((result) => {
            console.log("result from getActors", result.rows);
            res.sendStatus(200);
        })
        .catch((err) => {
            console.log("error in db.getActors", err);
        });
});

app.listen(8080, () => console.log("petition server running on port 8080"));
