const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
const createDishes = (req, res) => {
    const { data } = req.body;

    // Check for `data` object and 'href' within it
    if (!data || !data.href) {
        return res.status(400).json({ error: "Dishes URL (href) is required" });
    }

    // Create new dishId
    const newDish = { href: data.href, id: dishes.length + 1 };
    dishes.push(newDish);

    dishes.id = nextId();
    dishes.push(dishes);
    res.json({ data: dishes });
};

// List dishes
const listDishes = (req, res) => {
  res.json({ data: dishes });
};

module.exports = {
  createDishes,
  // read,
  // update,
  listDishes,
};