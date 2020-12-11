const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

//spiced pg ("who are we talking to: whichDbUserWillrunMyCommands")

module.exports.getSig = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSig = (signature, userId) => {
    const q = `INSERT INTO signatures (signature, user_id)
    VALUES ($1, $2) RETURNING id`;
    const params = [signature, userId];
    return db.query(q, params);
};

module.exports.addToDb = (firstName, lastName, email, hashedPw) => {
    const q = `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4) RETURNING id`;
    const params = [firstName, lastName, email, hashedPw];
    return db.query(q, params);
};

module.exports.addProfile = (age, city, url, user_id) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4) RETURNING id`;
    const params = [age || null, city || null, url || null, user_id];
    return db.query(q, params);
};

module.exports.allSigned = () => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
               FROM users
               LEFT JOIN user_profiles ON users.id = user_profiles.user_id
               JOIN signatures
               ON users.id = signatures.user_id;`;
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

module.exports.findByEmail = (email) => {
    const q = `SELECT * FROM users WHERE email = ($1)`;
    const params = [email];
    return db.query(q, params);
};

module.exports.findUsersByCity = (city) => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.url
            FROM users
            LEFT JOIN user_profiles ON users.id = user_profiles.user_id
            JOIN signatures 
            ON users.id = signatures.user_id
            WHERE city = ($1)`;
    const params = [city];
    return db.query(q, params);
};
