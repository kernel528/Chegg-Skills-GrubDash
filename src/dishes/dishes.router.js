const router = require("express").Router();

// TODO: Implement the /dishes routes needed to make the tests pass
const dishesController = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const notFound = require("../errors/notFound");
const errorHandler = require("../errors/errorHandler");

router
    .route("/")
    .get(dishesController.listDishes)
    .all(methodNotAllowed);

module.exports = router;
