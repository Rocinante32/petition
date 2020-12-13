exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.id) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (
        !req.session.id &&
        req.url != "/register" &&
        req.url != "/login" &&
        req.url != "/home"
    ) {
        res.redirect("/login");
    } else {
        next();
    }
};
