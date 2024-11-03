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

    if (foundOrder) {
        res.locals.orders = foundOrder; // Store the found Order ID for use in other handlers if needed
        return next();
    }
    next({
        status: 404,
        message: `Order does not exist ${orderId}.`
    })
}

// Read handler /orders/:orderId
function readOrder(req, res) {
    const { orderId } = req.params;

    // Find the order by `orderId` only
    const order = orders.find((entry) => entry.id === orderId);

    if (order) {
        return res.status(200).json({ data: order });
    } else {
        return res.status(404).json({ error: `Order does not exist: ${orderId}.` });
    }
}

/*
  POST
*/
// Make sure POST body has required fields.
function validateOrderPost(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({ status: 400, message: `Must include a ${propertyName}` });
    };
}

// Support POST to /orders
// This route will save the order and respond with the newly created order info
// TODO: Needs to support the dishes data array and validate as well.
function createOrder(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}


module.exports = {
    listOrders,
    readOrder: [orderExists, readOrder],
    createOrder,
}