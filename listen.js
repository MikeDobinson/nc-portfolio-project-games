const app = require('./app');

const { PORT = 9092 } = process.env;

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`listening on port ${PORT}`);
});
