const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

/*
  GET
*/
// List handler for /dishes (GET)
const listDishes = (req, res) => {
    res.json({ data: dishes });
};

// Middleware to check if `dishId` exists
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if (foundDish) {
        res.locals.dishes = foundDish; // Store the found Dish ID for use in other handlers if needed
        return next();
    }
    next({
        status: 404,
        message: `Dish does not exist ${dishId}.`
    })

    // If `dishId` does not exist, send 404 response with a message containing `dishId`
    // return res.status(404).json({ error: `Dish with ID ${dishId} not found` });
}

// Read handler /dishes/:dishId
function readDish(req, res) {
    const { dishId } = req.params;

    // Find the dish by `dishId` only
    const dish = dishes.find((entry) => entry.id === dishId);

    if (dish) {
        return res.status(200).json({ data: dish });
    } else {
        return res.status(404).json({ error: `Dish with ID ${dishId} not found` });
    }
}

/*
  POST
*/
// Make sure POST body has required fields.
// TODO: Update this to use validatePost(propertyName)...section 3.4.5 for hint
function validatePost(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    if (!name || !description || !price || !image_url) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    next();
}

// Support POST to /dishes
// This route will save the dish and respond with the newly created dish
function createDish(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
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
  PUT, Update
*/
// Support PUT to update /dishes/:dishId
// TODO:  Check to make sure dishId exists || 404, "Dish does not exist: ${dishId}."
// TODO:  Check to make sure dishId matches route id || 404, "Dish id does not match route id. Dish: ${id}, Route: ${dishId}"
function updateDish(req, res) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    const { data: { name, description, price, image_url } = {} } = req.body;

    // Update the Dish
    foundDish.name = name;
    foundDish.description = description;
    foundDish.price = price;
    foundDish.image_url = image_url;

    // const dish = dishes.find((entry) => entry.id === dishId);

    // if (!dishId || !foundDish) {
    //     // Return a 404 if the Dish ID is not found
    //     return res.status(404).json({ error: `Dish does not exist: ${dishId}` });
    // }
    //
    // if (data && data.href) {
    //     dish.href = data.href;
    // }

    res.json({ data: foundDish });
}

module.exports = {
    listDishes,
    readDish: [dishExists, readDish],
    createDish: [validatePost, createDish],
    updateDish: [validatePost, updateDish],
};