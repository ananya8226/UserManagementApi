const express = require('express');
const app = express();
const cors = require('cors');
const swagger = require('./swaggerDocs');
const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postRouter');
const adminRouter = require('./routes/adminRouter');
const { successResponse, failureResponse } = require('./utils/response');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

const corsOption = {
  origin: 'http://localhost:3000'
};

app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/v1/auth', userRouter);
app.use('/v1/user', postRouter);
app.use('/v1/admin', adminRouter);
app.use(swagger);

app.get('/', (req, res) => {
  try {
    return successResponse(res, 200, [], 'Rest Api working!');
  } catch (err) {
    return failureResponse(res, 400, JSON.stringify(err));
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
