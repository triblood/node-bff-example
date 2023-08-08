const express = require("express");
const https = require("node:https");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 3000;

const key = process.env.KEY;
const baseUrlCurrent = "https://api.weatherapi.com/v1/current.json?q=";

app.get("/currentWeather/", async (req, res) => {
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
