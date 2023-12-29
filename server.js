require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
var bodyParser = require("body-parser");

bodyParser.urlencoded({ extended: true });

const corsOptions = {
  origin: "*", // Tüm domainlere izin vermek
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middleware Example
app.use(function (req, res, next) {
  // console.log("Logged...");
  const start = Date.now();
  next();
  const delta = Date.now() - start;
  console.log(`${req.method} ${req.url} ${delta}ms`);
});

app.use(express.json());
app.use(cors(corsOptions));

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbCollectionName = process.env.DB_COLLECTION_NAME;
const cluster = process.env.DB_CLUSTER;
const port = 5000;

const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}`;

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

mongoose
  .connect(uri, options)
  .then(() => {
    app.listen(port, () =>
      console.log(`Sunucu çalışıyor:http://localhost:${port}`)
    );
  })
  .catch((error) => console.error("MongoDB bağlantısı sırasında hata:", error));

app.get("/data", async (req, res) => {
  try {
    const collection = mongoose.connection.collection(dbCollectionName);
    const docs = await collection.find().sort({ _id: -1 }).limit(1).toArray();
    return res.send(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

// GET a specific data
app.get("/data/:category/:item", async (req, res) => {
  try {
    const category = req.params.category;
    const item = req.params.item;

    const collection = mongoose.connection.collection(dbCollectionName);

    const pipeline = [
      {
        $match: {
          [category]: { $exists: true },
          [`${category}.${item}`]: { $exists: true },
        },
      },
      {
        $project: {
          _id: 0, // _id alanını çıkarma
          [category]: {
            [item]: `$${category}.${item}`, // İlgili 'category' ve 'item' alanını seç
          },
          modifyTime: 1,
        },
      },
    ];

    const docs = await collection.aggregate(pipeline).toArray();

    // Eğer veri bulunamazsa 404 Not Found hatası dönebilirsiniz
    if (docs.length === 0) {
      return res.status(404).send("Data not found");
    }

    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});
