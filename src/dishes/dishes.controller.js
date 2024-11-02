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
    const foundDishId = dishes.find((url) => url.id === Number(dishId));

    if (foundDishId) {
        res.locals.url = foundDishId; // Store the found Dish ID for use in other handlers if needed
        return next();
    }

    // If `dishId` does not exist, send 404 response with a message containing `dishId`
    return res.status(404).json({ error: `Dish with ID ${dishId} not found` });
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

// Determine what the next dishId would be...
let lastDishId = dishes.reduce((maxId, dish) => Math.max(maxId, dish.id), 0)

/*
  POST
*/
// Make sure POST body has required fields.
// function validatePost(req, res, next) {
//     const { data: { name } = {} } = req.body;
// }

// Support POST of new dish, validate body requirements
// const createDishes = (req, res) => {
//     const { data } = req.body;
//
//     // Check for `data` object and 'href' within it
//     if (!data || !data.href) {
//         return res.status(400).json({ error: "Dishes URL (href) is required" });
//     }
//
//     // Create new dishId
//     const newDish = { href: data.href, id: dishes.length + 1 };
//     dishes.push(newDish);
//
//     // dishes.id = nextId();
//     // dishes.push(dishes);
//     // res.json({ data: dishes });
// };



module.exports = {
    // createDishes: [],
    // readDish: [dishExists, readDish],
    readDish,
    // update,
    listDishes,
};