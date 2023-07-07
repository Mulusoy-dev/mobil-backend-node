const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();

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


app.get('/data', async (req, res) => {
  try {
    await mongoose.connect(uri, { useUnifiedTopology: true });
    const db = mongoose.connection;
    const collection = db.collection(dbCollectionName);
    const docs = await collection.find().sort({ _id: -1 }).limit(1).toArray();
    res.send(docs);
    db.close();
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => console.log(`Sunucu çalışıyor:http://localhost:${port}`));

setInterval(() => {
  axios.get('http://localhost:5000/data')
    .then(response => {
      const data = response.data;
      console.log('Güncellendi:', data);
    })
    .catch(error => {
      console.log('Veri alınamadı:', error.message);
    });
}, 60000);
