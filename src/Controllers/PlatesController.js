const knex = require("../database/knex");
const sqliteConnection = require("../database/sqlite");
const AppError = require("..//utils/AppError");
const DiskStorage = require("../providers/DiskStorageForPlate");

class PlatesController{
    async create(request, response){
        const data = request.body.data;
        
        const {title, description, category, ingredients, price} = JSON.parse(data);
        
        const user_id = request.user.id;
        const imagem = request.file.filename;
        
        const diskStorage = new DiskStorage();
        const filename = await diskStorage.saveFile(imagem);

        const [plate_id] = await knex("plates").insert({
            title,
            imagem: filename,
            description,
            category,
            price,
            user_id,
            ingredients: JSON.stringify(ingredients),
            user_id: 1
        });

        const ingredientsInsert = ingredients.map(name => {
            return{
                plate_id,
                name,
                user_id
            }
        });
        
        await knex("ingredients").insert(ingredientsInsert);

        return response.json().status(200);
    }

    async show(request, response){
        const {id} = request.params;

        const plate = await knex("plates").where({id}).orderBy("title");
        const ingredients = await knex("ingredients").where({plate_id: id}).orderBy("name");

        return response.json([
            ...plate,
            ingredients
        ]);
    }

    async delete(request, response){
        const {id} = request.params;
        const diskStorage = new DiskStorage();

        const plate = await knex("plates")
        .where({id}).first();
      
        if(plate.imagem){
            await diskStorage.deleteFile(plate.imagem);
        }
        await knex("plates").where({id}).delete();

        return response.json();
    }

    async index(request, response){
        const { title } = request.query;
       
        let plates;
        
        if(title){
                plates = await knex("plates")
                .whereLike("plates.title", `%${title}%`)
                .orderBy('title');

                plates.length !== 0 ?
                plates
                :
                plates = await knex("plates")
                .whereLike("plates.ingredients", `%${title}%`);

            }else{
                plates = await knex('plates').orderBy('title');
            }

            // console.log(plates)

        return response.json(plates.reverse());
    }
    
    async update(request, response){
        const plate_id = request.params.id;
        const {title, description, category, price, ingredients} = request.body;

        const database = await sqliteConnection();
        const plate = await database.get("SELECT * FROM plates WHERE id = (?)", [plate_id]);
        
        if(!plate) {
            throw new AppError("Prato não encontrado");
        };

        plate.title = title ?? plate.title;
        plate.description = description ?? plate.description;
        plate.category = category ?? plate.category;
        plate.price = price ?? plate.price;
        plate.ingredients = ingredients ?? plate.ingredients;

        await database.run(`
            UPDATE plates SET
            title = ?,
            description = ?,
            category = ?,
            price = ?,
            ingredients = ?
            WHERE id = ?`,
            [
                plate.title, 
                plate.description, 
                plate.category,
                plate.price, 
                JSON.stringify(plate.ingredients), 
                plate_id
            ]
        );
    
        return response.status(200).json();
    }
}

module.exports = PlatesController;