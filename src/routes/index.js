const { Router } = require('express');
const axios = require('axios');
const { Pokemon, Type } = require('../db');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

//TRAE INFO DE  LA API
const getApiInfo = async () => {
    const firstPage = await axios.get(`https://pokeapi.co/api/v2/pokemon`);
    const secondPage = await axios.get(firstPage.data.next);

    const allPokemons = firstPage.data.results.concat(secondPage.data.results);
    const result = await Promise.all(
        allPokemons.map(async e => {
            const pokemon = await axios(e.url);
            return {
                id: pokemon.data.id,
                name: pokemon.data.name,
                height: pokemon.data.height,
                width: pokemon.data.weight,
                hp: pokemon.data.stats[0].base_stat,
                atack: pokemon.data.stats[1].base_stat,
                defense: pokemon.data.stats[2].base_stat,
                speed: pokemon.data.stats[5].base_stat,
                type: pokemon.data.types.map(p => p.type.name),
                img: pokemon.data.sprites.front_transparent
            }
        }))
    return result
}


//TRAE LA INFO DE LA BASE
const getDbInfo = async () => {
    return await Pokemon.findAll(
        {
            include: {
                model: Type,
                attributes: ["name"],
                through: {
                    attributes: [],
                }
            }
        })
}


//CONCATENA LA INFO DE LA API Y LA DB
const getAllPokemon = async () => {
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const totalInfo = dbInfo.concat(apiInfo);
    return totalInfo;
}


//-----------------------------------------------GET A POKEMON
router.get('/pokemons', async (req, res) => {
    const { name } = req.query;
    let apiPokemon = await getAllPokemon();

    if (name) {
        let pokeName = apiPokemon.filter(c => c.name.toLowerCase() === name.toLowerCase());

        pokeName.length ? res.status(200).send(pokeName) : res.status(404).send('not pokefound');
    } else
        res.status(200).send(apiPokemon);
});



//--------------------------------------------------------------- GET A POKEMON ID
router.get('/pokemons/:id', async (req, res) => {
    const { id } = req.params;
    const apiPokemon = await getAllPokemon();

    try {
        let found = await apiPokemon.filter(e => e.id ? e.id == id : e.idbd == id)
        res.status(200).send(found)
    } catch (error) {
        res.status(404).send(error)
    }



})

//---------------------------------------------------------GET POKEMONS TYPE
// router.get('/types', async (req, res) => {
//     const apiTypes = await axios.get('https://pokeapi.co/api/v2/type')
//     const pokeTypes = apiTypes.data.results.map(e =>e.name)

//    const allTypes = pokeTypes.forEach(e => {
//     return  Type.findOrCreate({
//         where: { name: e }
//     })})
//     const types = await Type.findAll()
// res.status(200).send(types)
// })

router.get('/types', (req, res) => {
  axios.get('https://pokeapi.co/api/v2/type')
        .then((json) => json.data.results)
        .then(result=>result.map(e=>e.name))
        .then(names=>names.forEach(e => { return Type.findOrCreate({where:{name:e}})}))
        .then(types=>Type.findAll())
        .then((types)=> res.status(200).send(types))  
})

// -----------------------------------------------------------POST POKEMON
// let idbd = 100;
router.post('/pokemons', async (req, res) => {
    const { img, height, width, hp, atack, defense, speed, types, createInDb, name } = req.body;
if(!height|| !width || !hp || !atack || !defense || !speed || !types || !name){
    res.status(404).send("missing data")
}else{
    // /(www|http:|https:)+[^\s]+[\w]/.test(img)?img:img = "https://i.pinimg.com/originals/70/a6/9b/70a69b357b7ea034151f45e82425367f.png"
    

    try {
        let newPoke = await Pokemon.create(
            {
                img,
                name: name.toLowerCase(),
                height,
                width,
                hp,
                atack,
                defense,
                speed,
                createInDb,
            })

        let typesDb = await Type.findAll({
            where: { name: types }
        })
        newPoke.addType(typesDb)

        res.status(201).json(newPoke)
    } catch (error) {
        console.log(error)
        res.status(404).send(error)
    }
}
})

//DELETEAR
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params
    try {
        Pokemon.destroy({
            where: { idbd: id }
        })
        res.status(201).send("pokemon deleted")

    } catch (error) {
        res.send("el id no se encuentra en la tabla")
    }
})

//EDITAR
// router.put("/edit/:id",async(req,res)=>{
//     const {id} = req.params
//     const { img, height, width, hp, atack, defense, speed,name }= req.body;
//     try {
//         let idFound = await Pokemon.findOne({
//             where:{idbd:id}
//         })

//         idFound.name = name;

//             idFound.save()

//         res.send("pokemon updated")
//     } catch (error) {
//         res.send(error)
//     }
//   })

module.exports = router;
