const knex = require("../database/knex");

class IngredientsController {
    async show(request, response){
        const plate_id = request.params;

        const ingredients = await knex("ingredients").where({plate_id: plate_id.id});

        return response.json(ingredients);
    }

    async update(request, response){
        const user_id = request.user.id;

        const plate_id = request.params.id;
        const {ingredients} = request.body;

        await knex('ingredients').where({plate_id}).delete();
        
        const insertIngredients = ingredients.map(item => {
            return {
                name: item,
                plate_id,
                user_id
            }
        });
    
        await knex('ingredients').insert(insertIngredients);

        return response.status(200).json();
    }
}

module.exports = IngredientsController;