const RequestService = require("../services/RequestService");

exports.Index = async function (req, res) {
    const reqInfo = RequestService.reqHelper(req);
    res.render("index", {
        title: "SSD Yearbook",
        reqInfo: reqInfo,
    });
};