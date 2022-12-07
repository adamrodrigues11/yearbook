const RequestService = require("../services/RequestService");

exports.Index = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    if (reqInfo.authenticated) {
        return res.render("secure/secure-area", {
            reqInfo: reqInfo,
        });
    }
    else {
        res.redirect(
            "/user/login?errorMsg=You must be logged in to view this page"
        );
    }
};

exports.SetColour = async function (req, res) {
    let reqInfo = RequestService.reqHelper(req);
    if (reqInfo.authenticated) {
        let colour = req.body.favouriteColour;
        if (colour && colour.trim()); {
            // res.cookie("colour", colour, {maxAge: 60 * 1000});
            // reqInfo.colour = colour;
            const sessionData = req.session;
            sessionData.colour = colour;
            reqInfo.colour = colour;
        }
        return res.render("secure/secure-area", { reqInfo: reqInfo });
    }
    else {
        res.redirect(
            "/user/login?errorMsg=You must be logged in to view this page."
        );
    }
};