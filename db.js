const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//spiced pg ("who are we talking to: whichDbUserWillrunMyCommands")

module.exports.getActors = () => {
    return db.query(`SELECT * FROM petition`);
};
