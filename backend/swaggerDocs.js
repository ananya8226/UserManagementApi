/* eslint-disable n/no-path-concat */
const { Router } = require('express');
const path = require('path');
const yamljs = require('yamljs');
const swaggerDocument = yamljs.load(path.resolve(`${__dirname}/swagger.yaml`));
const swaggerUi = require('swagger-ui-express');
const router = Router();
// swaggerDocument.host = `${process.env.SERVER_IP}:${process.env.PORT}`;
router.get('/docs.json', (req, res) => res.send(swaggerDocument));
router.use('/v1', swaggerUi.serve, (req, res) => res.send(swaggerUi.generateHTML(swaggerDocument)));

module.exports = router;
