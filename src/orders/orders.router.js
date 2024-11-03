const router = require("express").Router();

// TODO: Implement the /orders routes needed to make the tests pass
const ordersController = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const notFound = require("../errors/notFound");
const errorHandler = require("../errors/errorHandler");
const express = require("express");

router
    .route("/")
    .get(ordersController.listOrders)
    .all(methodNotAllowed);

module.exports = router;
