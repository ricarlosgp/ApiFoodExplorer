const {hash} = require("bcryptjs");
const knex = require("../database/knex");

class UserController {
    async create(request, response) {

      try {
        const {name, email, password} = request.body;
        
        const checkuserExists = await knex.select('email').where({email}).from('users')

        if (checkuserExists.length > 0){
          return response.status(401).json({ error: "Este email já está em uso." });
        };
    
        const hashedPassword = await hash(password, 8);
    
        await knex('users').insert({
          name,
          email,
          password: hashedPassword,
          admin: false
        });
    
        return response.status(200).json();

      }catch(err){
        return console.log(err)
      }
  }
}

module.exports = UserController;