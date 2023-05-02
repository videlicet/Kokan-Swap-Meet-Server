/* For more on Error Handling, visit https://expressjs.com/en/guide/error-handling.html please be aware errors in synchronous and asynchronous code has to be 
dealt with differently */

const errorHandler = (err, req, res, next) => {
  // log err.stack only on non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  // returns a response with a 500 code, you could create a custom Error class with custom status ;)
  res.status(err.statusCode || 500).json({ msg: err.message });
};

export default errorHandler;
