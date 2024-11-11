const path = require("path");
const orders = require(path.resolve("src/data/orders-data")); // Use the existing order data
const nextId = require("../utils/nextId"); // Use this function to assign ID's when necessary

/* 
  Middleware Functions
*/

// Middleware to check if `orderId` exists
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    // Check if there is no matching order, then respond with 404 and error message:
    // Review Status:  COMPLETE
    if (!foundOrder) {
        return res.status(404).json({
            error: `Order does not exist ${orderId}.`
        });
    }

    // If the order exists, attach it to res.locals for further use...
    res.locals.orders = foundOrder; // Store the found Order ID for use in other handlers if needed
    return next();
}

// Middleware to validate a property in the body
function validateOrder(propertyName) {
    return function (req, res, next) {
        const { data: orderData = {} } = req.body;
        const orderStatus = orderData.status;

        if (orderData[propertyName]) {
            if (orderStatus && (!orderStatus || orderStatus === "")) {
                return next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` });
            }
            return next();
        }

        next({ status: 400, message: `Order must include a ${propertyName}` }); // --> This is where the status validation was failing.
    };
}

// Middleware to validate the status property
function validateStatus(req, res, next) {
    const { data = {} } = req.body;
    const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];

    if (!data.status) {
        next({
            status: 400,
            message: "Order must include aaa status"  // --> This is where the status validation was failing.
        });
    }

    if (!validStatuses.includes(data.status)) {
        return next({
            status: 400,
            message: `Order status must be one of ${validStatuses.join(", ")}. Received: ${data.status}`
        });
    }

    next();
}

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

/*
  GET
*/
// List handler for /order (GET)
const listOrders = (req, res) => {
    res.json({ data: orders });
};

// Read handler /orders/:orderId
function readOrder(req, res) {
    const foundOrder = res.locals.orders;
    res.status(200).json({data: foundOrder});
}

/*
   POST
*/
// Create a new order, with status property validation
function createOrder(req, res) {
    // const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes
    };

    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

/*
  PUT
*/
function updateOrder(req, res) {
    const foundOrder = res.locals.orders;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    // Ensure id in the request body matches the orderId from the route
    const orderId = foundOrder.id;
    if (id && id !== req.params.orderId) {
        return res.status(400).json({
            error: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}`
        });
    }

    // Check if status is valid
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if (status && !validStatus.includes(status)) {
        return res.status(400).json({
            error: `Order must have a status of one of ${validStatus}.`
        });
    }

    // Check if the order status is "delivered", if so reject updates...
    if (foundOrder.status === "delivered") {
        return res.status(400).json({
            error: `A delivered order cannot be changed.`
        });
    }

    // Validations pass, Update the Order
    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.status = status || foundOrder.status;
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
        validateOrder("deliverTo"),
        validateOrder("mobileNumber"),
        // validateOrder("status"),
        // validateStatus,
        validateDishes,
        createOrder,
    ],
    updateOrder: [
        orderExists,
        validateOrder("deliverTo"),
        validateOrder("mobileNumber"),
        validateStatus,
        validateDishes,
        updateOrder
    ],
    deleteOrder: [
        orderExists,
        deleteOrder
    ],
}
