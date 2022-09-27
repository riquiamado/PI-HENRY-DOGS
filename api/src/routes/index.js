 require('dotenv').config();
const { Router } = require('express');
const router = Router();
const APIKEY = process.env.YOUR_API_KEY
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const routDoguis = require('./routdoguis.js')
const routeTemperaments = require('./routeTemperaments.js')


router.use('/dogs', routDoguis)
router.use('/temperaments', routeTemperaments)

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;

/*require('dotenv').config();
const { Router } = require('express');
const router = Router();
const APIKEY = process.env.YOUR_API_KEY
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const rdogs = require('./rdogs.js')
const rtemperaments = require('./rtemperaments.js')


router.use('/dogs', rdogs)
router.use('/temperaments', rtemperaments)
// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;*/