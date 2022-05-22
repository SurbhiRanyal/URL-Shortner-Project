const urlModel = require("../models/urlModel");
const shortId = require("shortid");
const validUrl = require("valid-url");
const baseUrl = "http://localhost:3000";
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  17658,
  "redis-17658.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("lE0EZUgxZIjUeJgvDZqZw6sZsttoq3IQ", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const urlCreate = async function (req, res) {
  try {
    let data = req.body;
    // check base url if valid using the validUrl.isUri method
    if (!validUrl.isUri(baseUrl)) {
      return res.status(401).send({status:false,msg:"Invalid base URL"});
    }
    if (!Object.keys(data).length > 0) {
      return res.status(400).send({status:false, msg:"Invalid request parameter"});
    }
    const { longUrl } = data; // destructure the longUrl from req.body.longUrl
    // check longurl present or not
    if (!longUrl) {
      return res.status(400).send({status:false, msg:"longurl required"});
    }

    // check long url if valid using the validUrl.isUri method
    if (!validUrl.isUri(longUrl)) {
      return res.status(400).send({status:false, msg:"longurl is not valid"});
    }
    let cahcedData = await GET_ASYNC(`${longUrl}`);
    //
    let dataa = JSON.parse(cahcedData);
    // url exist and return the respose
    if (dataa) {
      return res
        .status(200)
        .send({
          status: true,
          dataa: {
            longUrl: dataa.longUrl,
            shortUrl: dataa.shortUrl,
            urlCode: dataa.urlCode,
          },
        });
    }
    // if valid, we create the url code
    const urlCode = shortId.generate();

    // join the generated short code the the base url
    const shortUrl = baseUrl + "/" + urlCode;

    // invoking the Url model and saving to the DB
    let url = { longUrl, shortUrl, urlCode };
    const code = await urlModel.create(url);
    await SET_ASYNC(`${code.longUrl}`, JSON.stringify(code));

    res.status(201)
      .send({
        status: true,
        message: "You created Short Url for this Long Url",
        data: {
          longUrl: code.longUrl,
          shortUrl: code.shortUrl,
          urlCode: code.urlCode,
        },
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports.urlCreate = urlCreate;

