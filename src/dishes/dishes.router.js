const router = require("express").Router({ mergeParams: true });


// TODO: Implement the /dishes routes needed to make the tests pass
const dishesController = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
    .route("/")
    .get(dishesController.listDishes)
    .post(dishesController.createDish)
    .all(methodNotAllowed);

router
    .route("/:dishId")
    .get(dishesController.readDish)
    .put([
        dishesController.dishExists,
        dishesController.updateDish
    ])
    .all(methodNotAllowed);


module.exports = router;