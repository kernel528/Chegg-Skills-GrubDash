const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

/*
  GET
*/
// List handler for /order (GET)
const listOrders = (req, res) => {
    res.json({ data: orders });
};

// Middleware to check if `orderId` exists
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    // Check if there is no matching order, then respond with 404 and error message:
    if (!foundOrder) {
        return res.status(404).json({
            error: `Order does not exist ${orderId}.`
        });
    }

    // If the order exists, attach it to res.locals for further use...
    res.locals.orders = foundOrder; // Store the found Order ID for use in other handlers if needed
    return next();
}

// Read handler /orders/:orderId
function readOrder(req, res) {
    const foundOrder = res.locals.orders;
    res.status(200).json({data: foundOrder});
}

/*
  POST
*/
// Make sure POST body has required fields.
function validateOrderPost(propertyName, validateStatus = false) {
    return function (req, res, next) {
        const { data = {} } = req.body;

        // Check if the property is present
        if (!data[propertyName] && propertyName !== "id") {
            return next({ status: 400, message: `Order must include a ${propertyName}` });
        }

        // Check status property, when present, contains a valid property
        if (validateStatus && propertyName === "status") {
            const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
            if (!validStatus.includes(data[propertyName])) {
                return next({
                    status: 400,
                    message: `Order must have a status of ${validStatus}`
                });
            }
        }

        // Additional "id" property validation for update method
        if (propertyName === "id") {
            const { id } = data;
            if (!id) {
                return next({ status: 400, message: `Order must include an id` });
            }

            // Check to make sure the id in the body matches the route id --> This is only needed for updates
            if (id !== req.params.orderId) {
                return ({
                    status: 400,
                    message: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}`
                })
            }
        }

        return next();

    };
}

//
// Middleware to validate the dishes array
function validateDishes(req, res, next) {
    const { data: { dishes } = {} } = req.body;

    // Validation: Check if dishes is not an array
    if (!Array.isArray(dishes)) {
        return next({ status: 400, message: "Order must include at least one dish." });
    }

    // Validation: Check if dishes array is empty
    if (dishes.length === 0) {
        return next({ status: 400, message: "Order must include at least one dish." });
    }

    // Validate each dish's quantity
    for (let i = 0; i < dishes.length; i++) {
        const { quantity } = dishes[i];

        // Validation: Check if quantity is missing
        if (quantity === undefined) {
            return next({ status: 400, message: `dish ${i} must have a quantity that is an integer greater than 0.` });
        }

        // Validation: Check if quantity is zero or less
        if (quantity <= 0) {
            return next({ status: 400, message: `dish ${i} must have a quantity that is an integer greater than 0.` });
        }

        // Validation: Check if quantity is not an integer
        if (!Number.isInteger(quantity)) {
            return next({ status: 400, message: `dish ${i} must have a quantity that is an integer greater than 0.` });
        }
    }

    next(); // All validations passed
}

// Create a new order, with status property validation
function createOrder(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    // Ensure status is provided and valid
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if (!status || !validStatus.includes(status)) {
        return res.status(400).json({
            // error: `Order must have a status of ${validStatus}`
            error: `Order must include a valid status. Valid statuses are: ${validStatus.join(", ")}.`
        });
    }

    // Create the order
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
    dishes.push(newOrder);
    res.status(201).json({ data: newOrder });
}

/*
  PUT, Update
*/
function updateOrder(req, res, next) {
    const foundOrder = res.locals.orders;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    // Order id validation is handled by validateOrderPost middleware
    // Check if status is valid
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if (status && !validStatus.includes(status)) {
        return res.status(400).json({
            error: `Order must have a status of one of ${validStatus}.`
        });
    }

    //

    // // Check if the id in the request body matches the dishId from the URL
    // if (id && id !== req.params.orderId) {
    //     return res.status(400).json({
    //         // error: `Order id does not match route id. Order: ${id}, Route: ${req.params.id}`
    //         error: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}`
    //     });
    // }
    //
    // // Make sure status is not missing or empty
    // if (status === undefined || status === null) {
    //     return res.status(400).json({
    //         error: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    //     });
    // }
    //

    // Check if the order status is "delivered", if so reject updates...
    if (foundOrder.status === "delivered") {
        return res.status(400).json({
            error: `A delivered order cannot be changed.`
        });
    }

    //
    // // Ensure the status is valid, if provided...
    // const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    // if (status && !validStatus.includes(status)) {
    //     return res.status(400).json({
    //         error: `Order must have a status of ${validStatus}.`
    //     });
    // }

    // Validations pass, Update the Order
    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.status = status;
    foundOrder.dishes = dishes;

    res.json({ data: foundOrder });
}

/*
  Delete
*/
function deleteOrder(req, res) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    // If no order is found, return a 404
    if (!foundOrder) {
        return res.status(404).json({
            error: `Order does not exist ${orderId}.`
        });
    }

    // Check if order status is "pending".  If not, return a 400 error.
    if (foundOrder.status !== "pending") {
        return res.status(400).json({
            error: `An order cannot be deleted unless it is pending.`
        });
    }

    // Delete the order
    orders.splice(orders.indexOf(foundOrder), 1);

    // Return a 204 status for a successful order delete
    return res.status(204).send();
}

module.exports = {
    listOrders,
    readOrder: [orderExists, readOrder],
    createOrder: [
        validateOrderPost("deliverTo"),
        validateOrderPost("mobileNumber"),
        validateOrderPost("status", true),
        validateOrderPost("dishes"),
        validateDishes,
        createOrder,
    ],
    updateOrder: [
        orderExists,
        validateOrderPost("id"),
        validateOrderPost("deliverTo"),
        validateOrderPost("mobileNumber"),
        validateOrderPost("status", true),
        validateOrderPost("dishes"),
        validateDishes,
        updateOrder
    ],
    deleteOrder: [
        orderExists,
        deleteOrder
    ],
}