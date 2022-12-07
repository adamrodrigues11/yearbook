const express = require("express");
const indexRouter = express.Router();
const path = require("path");
// const viewData = {
//     title: "Test"
//     // aboutTitle: "About"

//   };

const projectTitle = "Express Yourself"
indexRouter.get("/", (req, res) => res.render("index",{title: `${projectTitle} - Home`}));  
indexRouter.get("/about", (req, res) => res.render("about",{title: `${projectTitle} - About`}));



indexRouter.get("/contact", (req, res) => {
    res.render("contact", {
        title: `${projectTitle} - Contacts`,
        status: null,
    });
});

indexRouter.post("/contact", (req, res) => {
    res.render("contact", {
        title: `${projectTitle} - Contacts`,
        status: "received",
        formData: req.body
    });
});

module.exports = indexRouter;