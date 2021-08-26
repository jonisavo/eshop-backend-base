const mongoose = require('mongoose');

require('dotenv').config();

const port = parseInt(process.env.PORT, 10);

const app = require('./utils/create_app');

mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.MONGO_CONSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'eshop-database'
}).then(() => {
    console.log('Database connection is ready...')
  })
  .catch((err) => {
    console.error(err)
  })

app.listen(port, () => {
  console.log(`The server is running in port ${port}`);
})
