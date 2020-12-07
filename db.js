const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//spiced pg ("who are we talking to: whichDbUserWillrunMyCommands")

module.exports.getSig = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSig = (firstName, lastName, signature) => {
    const q = `INSERT INTO signatures (first, last, signature)
    VALUES ($1, $2, $3) RETURNING id`;
    const params = [firstName, lastName, signature];

    return db.query(q, params);
};

module.exports.allSigned = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

module.exports.numSigned = () => {
    const q = "SELECT COUNT (*) FROM signatures";
    return db.query(q);
};

module.exports.findById = (id) => {
    const q = "SELECT signature FROM signatures WHERE id = ($1)";
    const params = [id];
    return db.query(q, params);
};
