// Changed to port 5001 due to local macos airdrop using port 5000
const { PORT = 5001} = process.env;

const path = require("path");
const app = require(path.resolve(
  `${process.env.SOLUTION_PATH || ""}`,
  "src/app"
));

// const listener = () => console.log(`Listening on Port ${PORT}!`);
// Modified this for local testing as it allows me to easily click on link to open browser
const listener = () => console.log(`Express server running at http://localhost:${PORT}!`);
app.listen(PORT, listener);
