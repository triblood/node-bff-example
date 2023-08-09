const express = require("express");

const https = require("node:https");

const dotenv = require("dotenv");
const cache = require("memory-cache");

dotenv.config();

const app = express();
const port = 3000;

const key = process.env.KEY;
const baseUrlCurrent = "https://api.weatherapi.com/v1/current.json?q=";

const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = "__express__" + req.originalUrl || req.url;
    const cachedBody = cache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        cache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
};

app.get("/currentWeather/", cacheMiddleware(180), async (req, res) => {
  console.log("searching data to: " + req.query.cityName);

  await https
    .get(
      baseUrlCurrent + req.query.cityName + "&lang=pt&key=" + key,
      (resp) => {
        let data = [];
        resp.setEncoding("binary");

        const headerDate =
          resp.headers && resp.headers.date
            ? resp.headers.date
            : "no response date";
        console.log("Status Code:", resp.statusCode);
        console.log("Date in Response header:", headerDate);

        resp.on("data", (chunk) => {
          const dataJson = JSON.parse(chunk);
          res.json(dataJson);
        });

        resp.on("end", () => {
          console.log("Response ended: ");
        });
      }
    )
    .on("error", (err) => {
      console.log("Error: ", err.message);
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
