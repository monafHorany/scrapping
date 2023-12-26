const express = require("express");
const scraper = require("./scraper.js");
const updater = require("./updater.js");
const app = express();
const port = 5000;

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/", (req, res) => {
  res.send("Hello From Perllamoda Server");
});

app.get("/api/scraper/:link", (req, res, next) => {
  var importurl = req.params.link; // console shows that req.param("link") is deprecated that's why i changed to req.params.link
  scraper.getProductsData(importurl).then((result) => {
    if (result) {
      const final = result.flat();
      res.setHeader("Content-Type", "application/json");
      console.log(final.length)
      res.end(JSON.stringify(final));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify("error"));
    }
  });
});

app.get("/api/updater/:link", (req, res, next) => {
  console.log("Requesting");
  var importurl = req.params.link; // console shows that req.param("link") is deprecated that's why i changed to req.params.link
  updater.getProductsData(importurl).then((result) => {
    if (result) {
      const final = result.flat();
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(final));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify("error"));
    }
  });
});

app.listen(port, () => {
  console.log("Node App listening at port " + port);
});
