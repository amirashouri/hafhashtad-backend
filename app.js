const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("./services/cache");

//const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const chargesRoutes = require("./routes/charges-routers");
const rolesRoutes = require("./routes/roles-routes");

const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/charges", chargesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/roles", rolesRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://amirreza:Amir123456@cluster0-4qwzg.mongodb.net/hafhashtadDB?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("app Started on port 5000 ...");
    });
  })
  .catch((err) => {
    console.log(err);
  });
