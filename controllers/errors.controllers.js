exports.handleWrongFilepathErrors = (req, res) => {
  res.status(404).send({ msg: 'Invalid URL' });
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === '22P02') {
    console.log(err.message);
    res.status(400).send({ msg: 'Invalid request' });
  } else if (err.code === '23503') {
    console.log(err.message);
    res.status(404).send({ msg: 'User not found' });
  } else if (err.code === '23502') {
    console.log(err.message);
    res.status(400).send({ msg: 'Invalid format' });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  const { status, msg } = err;
  if (status && msg) {
    res.status(status).send({ msg });
  } else {
    next(err);
  }
};

exports.handle500statuses = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: 'Internal Server Error' });
};
