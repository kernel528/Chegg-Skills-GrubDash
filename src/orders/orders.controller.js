const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
/*
  GET
*/
// List handler for /order (GET)
const listOrders = (req, res) => {
    res.json({ data: orders });
};

module.exports = {
    listOrders,
    // readOrder,
    // createOrder,
}