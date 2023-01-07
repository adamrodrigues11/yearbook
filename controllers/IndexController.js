const RequestService = require("../services/RequestService");

exports.Index = async function (req, res) {
    // display homepage
    // still check reqInfo to display appropriate nav options
    const reqInfo = await RequestService.reqHelper(req);
    res.render("index", {
        title: "SSD Yearbook",
        reqInfo: reqInfo,
    });
};