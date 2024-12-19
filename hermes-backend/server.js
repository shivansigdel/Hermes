const express = require("express");
const cors = require("cors"); // Import CORS
const app = express();
const port = 5001;

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.listen(port, () => {
  console.log("Server running on 5001");
});
