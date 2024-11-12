const router = require("express").Router({ mergeParams: true });


// TODO: Implement the /orders routes needed to make the tests pass
const ordersController = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");


router
    .route("/")
    .get(ordersController.listOrders)
    .post(ordersController.createOrder)
    .all(methodNotAllowed);

router
    .route("/:orderId")
    .get(ordersController.readOrder)
    .put(ordersController.updateOrder)
    .delete(ordersController.deleteOrder)
    .all(methodNotAllowed);

module.exports = router;