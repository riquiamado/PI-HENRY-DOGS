require('dotenv').config();
const APIKEY = process.env.YOUR_API_KEY;

const {Router} = require('express')
const router = Router()

const axios = require('axios')

const { Temperaments } = require('../db')

router.get('/',/* http://localhost:3001/temperaments */ async (req, res) => {
    const response = await axios.get('https://api.thedogapi.com/v1/breeds');
    const temperamentsData = response.data

    //'https://api.thedogapi.com/v1/breeds'
    try {
         // si ya los tengo cargados en la DB los consumo desde alli.
         const temperamentsDb = await Temperaments.findAll();
         //console.log(temperamentsDb)
         if (temperamentsDb.length >= 1) return res.json(temperamentsDb)
        



        let everyTemperament = temperamentsData.map(dog => dog.temperament ? dog.temperament : "No info").map(dog => dog?.split(', '));
        /* Set para hacer UNIQUE :: Stackoverflow */
        let eachTemperament = [...new Set(everyTemperament.flat())];
        eachTemperament.forEach(el => {
            if (el) { // temperament : ,
                Temperaments.findOrCreate({
                    where: { name: el }
                });
            }
        });
       // eachTemperament = await Temperament.findAll();
        res.status(200).json(eachTemperament);
    } catch (error) {
        res.status(404).send(error)
    }
});




module.exports = router