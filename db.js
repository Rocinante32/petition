const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/actors");

//spiced pg ("who are we talking to: whichDbUserWillrunMyCommands")

module.exports.getActors = () => {
    return db.query(`SELECT * FROM actors`);
};
