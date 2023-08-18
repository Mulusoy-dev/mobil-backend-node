const express = require('express');
const app = express();
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false })



app.use(express.json());
app.use(cors());

require('dotenv').config();
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
}


mongoose.connect(uri, options)
  .then(() => {
    app.listen(port, () => console.log(`Sunucu çalışıyor:http://localhost:${port}`));
  })
  .catch(error => console.error('MongoDB bağlantısı sırasında hata:', error));


  app.post('/alldata', async (req, res) => {
    try {
      const filterValue = req.body.category; // İstemciden gelen kategori
  
      const collection = mongoose.connection.collection(dbCollectionName);
      const docs = await collection.find({}).toArray(); // Tüm verileri çekiyoruz
  
      const result = docs.map(doc => {
        return {
          _id: doc._id,
          data: doc[filterValue]
        }
      });
  
      console.log(result);
  
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });



app.get('/data', async (req, res) => {
  try {
    const collection = mongoose.connection.collection(dbCollectionName);
    const docs = await collection.find().sort({ _id: -1 }).limit(1).toArray();
    res.send(docs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


