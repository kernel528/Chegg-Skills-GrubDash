const router = require("express").Router();
// const router = express.Router({ mergeParams: true });

// TODO: Implement the /dishes routes needed to make the tests pass
const dishesController = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const notFound = require("../errors/notFound");
const errorHandler = require("../errors/errorHandler");
const express = require("express");

router
    .route("/")
    .get(dishesController.listDishes)
    .post(dishesController.createDish)
    .all(methodNotAllowed);

router
    .route("/:dishId")
    .get(dishesController.readDish)
    .put(dishesController.updateDish)
    .all(methodNotAllowed);


module.exports = router;
