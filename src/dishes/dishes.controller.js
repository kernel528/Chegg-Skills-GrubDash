const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data")); // Use the existing dishes data
const nextId = require("../utils/nextId"); // Use this function to assign ID's when necessary

/*
  Middleware Functions
*/

// Middleware to check if `dishId` exists and matches the route id.
// If `dishId` does not exist, send 404 response with a message containing `dishId`
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if (!foundDish) {
        return res.status(404).json({
            error: `Dish does not exist ${dishId}.`
        });
    }

    // If the dish exists, attach it to res.locals for further use...
    res.locals.dishes = foundDish; // Store the found Dish ID for use in other handlers if needed
        return next();
}

// Make sure POST body has required fields.
function validateDish(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({ status: 400, message: `Dish must include a ${propertyName}` });
    };
}

/*
  GET
*/
// List handler for /dishes (GET)
const listDishes = (req, res) => {
    res.json({ data: dishes });
};

// Read handler /dishes/:dishId
function readDish(req, res) {
    const foundDish = res.locals.dishes;
    res.status(200).json({data: foundDish});
}

/*
  POST
*/

// Create the dish, validating price is a number and > 0, respond with the newly created dish
function createDish(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;

    // Make sure price is greater than 0 and is an integer/number. --> Can this be moved to a validatePrice handler?
    if (typeof price !== "number" || price <= 0) {
        return res.status(400).json({
            error: "Dish must have a price that is an integer greater than 0."
        });
    }

    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

/*
  PUT
*/
// Update the dish, validate dish id matches route id in url, validate price and image_url exists
function updateDish(req, res) {
    const foundDish = res.locals.dishes;
    const { data: { id, name, description, price, image_url } = {} } = req.body;

    // Check if the id in the request body matches the dishId from the URL
    if (id && id !== req.params.dishId) {
        return res.status(400).json({
            error: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`
        });
    }

    // Check to make sure price exists
    if (price === undefined || price === null) {
        return res.status(400).json({
            error: "Dish must include a price."
        });
    }

    // Make sure price is greater than 0 and is an integer/number.
    if (typeof price !== "number" || price <= 0) {
        return res.status(400).json({
            error: "Dish must have a price that is an integer greater than 0."
        });
    }

    // Make sure image_url isn't missing
    if (image_url === undefined || image_url === null ) {
        return res.status(400).json({
            error: "Dish must include an image_url."
        });
    }

    // Update the Dish
    foundDish.name = name;
    foundDish.description = description;
    foundDish.price = price;
    foundDish.image_url = image_url;

    res.json({ data: foundDish });

}

module.exports = {
    listDishes,
    readDish: [dishExists, readDish],
    createDish: [
        validateDish("name"),
        validateDish("description"),
        validateDish("price"),
        validateDish("image_url"),
        createDish
    ],
    updateDish: [
        validateDish("name"),
        validateDish("description"),
        validateDish("price"),
        validateDish("image_url"),
        dishExists,
        updateDish
    ],
    dishExists,
};