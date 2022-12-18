// only home page

const express = require("express");
const indexRouter = express.Router();
const indexController = require("../controllers/IndexController");

indexRouter.get("/", indexController.Index);  

module.exports = indexRouter;