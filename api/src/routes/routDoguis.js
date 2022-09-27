//esta parte requiere y setea desde el .env la apikey
require('dotenv').config();
const axios = require('axios')
const express = require('express');
const router = express.Router();
const {Temperaments,Dog}= require('../db')


router.use(express.json())

router.get('/', async (req,res)=>{
    let dogsDB = await Dog.findAll({
        include: Temperaments
        });       
    
    
    //Parseo el objeto
    dogsDB = JSON.stringify(dogsDB);
    dogsDB = JSON.parse(dogsDB); //// obtengo un json de la instancia de la tabla de dogs
    console.log(dogsDB)
    //Aca dejo el arreglo de generos plano con solo los nombres de cada genero(llega array de objetos)
    //console.log(videogamesDb)
    console.log('aca termina el sin reduce')

    dogsDB = dogsDB.reduce((acc, el) => acc.concat({
        ...el, temperaments: el.temperaments.map(g => g.name)//Me quedo solo con el nombre de cada temperaments
    }), [])// 

    console.log(dogsDB)
    dogsDB.map(x => {
        ['temperaments'].forEach(key => {
          x[key] = x[key].toString();
        });
        return x;
      });

    if (req.query.name){
     try {
     let response = await axios.get(`https://api.thedogapi.com/v1/breeds/search?q=${req.query.name}`);
     if (response.data.length === 0) return res.status(404).json('raza no encontrada');
     const dogsRaza = response.data.map(d => {
         return{
             id: d.id,
             name: d.name,
             weight: d.weight.metric,
             height: d.height.metric,
             life_span: d.life_span,
             temperament: d.temperament,
             image: d.image
             }
     });
     const searchDb = dogsDB.filter(el => el.name.toLowerCase().includes(req.query.name.toLowerCase()));
        const resultado = [...searchDb, ...dogsRaza]
         return res.status(200).json(resultado)
         
     } catch (error) {
             res.sendStatus(500).json('no hay raza')
             throw new Error(error) 
     }
    }
      
    else{
        try {
       
            let response = await axios.get('https://api.thedogapi.com/v1/breeds');
           
              //filtro solo la DATA que necesito enviar al FRONT
                 const dogsREADY = response.data //llena la const con lo que hay en esa pagina en la api en ese momento dentro de results que es un arreglo dentro de la api
                 .map(d => {    //mapea solo lo que me piden
                     return{
                         id: d.id,
                         name: d.name,
                         weight: d.weight.metric,
                         height: d.height.metric,
                         life_span: d.life_span,
                         temperaments: d.temperament,
                         image: d.image.url
                         }
                 });
           
                 //const result = [dogsREADY].splice(0,8)----------- ver si hace falta cortar el array en 8 aca o 
                 //se hace desde el front

                 let dogsTOTALS = [...dogsDB,...dogsREADY]
            
             return res.json(dogsTOTALS)
        } catch (err) {
            res.sendStatus(500)
            throw new Error(err) 
        }
    }
    })
    
    router.post('/',async(req,res)=>{
        let { name, weight, height, life_span, temperament, image } = req.body
        
       
        const capitalizar = (name)=> {
            return name.charAt(0).toUpperCase() + name.slice(1);
          }
    
        if(!name || !height || !weight)
        return res.status(400).json({msg:"faltan datos"})
    
        try {
            image = await (await axios.get('https://dog.ceo/api/breeds/image/random')).data.message;
            const dogCREATED = await Dog.findOrCreate({ //devuelvo un array (OJOOO!!!!)
              
                where: {
                    name: capitalizar(name),
                    weight,
                    height,
                    life_span,
                    image:image || 'https://dog.ceo/api/breeds/image/random'
                }
             })
                   
            await dogCREATED[0].setTemperaments(temperament); // relaciono ID genres al juego creado
           // console.log(dogCREATED[0])
                          
            res.json(dogCREATED)
            
        } catch (err) {
            throw new Error(err)
        }
    })
    router.get('/:idRaza', async (req,res)=>{
        try {
            const { idRaza } = req.params;
            const response = await axios.get(`https://api.thedogapi.com/v1/breeds/${idRaza}`);
            
            let { id, name, weight, height, life_span, temperament, reference_image_id } = response.data;
           
            // dog = genres.map(g => g.name); // ACA MODIFICO EL ARRAY ENORME DE GENEROS SIMPLIFICANDOLO A UNO QUE SOLO TARE LOS NOMBRES
            //CONVIERTO TODO A JSON CON SOLAMENTE LOS CAMPOS QUE ME PIDIERON Y LO RETORNO
            return res.json({
                id,
                name,
                weight,
                height,
                life_span,
                temperament,
                reference_image_id: `https://cdn2.thedogapi.com/images/${reference_image_id}.jpg`   
            })
            
        } catch (err) {
            res.sendStatus(500)
            throw new Error('funciono el error') 
        }
    })



   // xporto el modulo para que index.js tenga acceso-----recordar importar en index.js
    module.exports = router

