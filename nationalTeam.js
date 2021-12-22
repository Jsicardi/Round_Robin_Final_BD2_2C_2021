const Joi = require('joi');

class NationalTeamApi {
 
    static async getNationalTeamById(id,client){
        try{
            const results = await client.query(`SELECT * FROM national_team WHERE national_team_id=${id}`);
            return results.rows
        }
        catch(e){
            console.log(e);
        }
    }

    static async getNationalTeams(params,client,pageSize){
        
        // const limitParam = params.limit;
        const pageParam = params.page;
        
        //Define page default

        const pageDefault = 1;
        let page = pageDefault;
        let limit = pageSize;

        //Check if page query param is defined
        if(pageParam!==undefined){
            page = parseInt(pageParam);
        }

        try{
            const results = await client.query(`SELECT * FROM national_team ORDER BY national_team_name LIMIT ${limit} OFFSET ((${page}-1) * ${limit})`);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }

    }

    static async getCountNationalTeams(client){
        try{
            const results = await client.query(`SELECT COUNT(*) FROM national_team`);
            return results.rows[0].count;
        }
        catch(e){
            console.log(e);
        }
    }


        //ValidateNationalTeamParams
    //0-/api/nationalTeams/:id
    //1-/api/nationalTeams
    static validateNationalTeamPararms(params,index){
    
        let schema;
        
        switch(index){
            case 0:
                schema = {
                    id : Joi.number().min(0).required()
                }
                break;
            case 1:
                schema = {
                    page : Joi.number().min(1),
                    limit : Joi.number().min(1)
                }
                break;
    
        }

        return Joi.validate(params,schema);
    }

}

module.exports = NationalTeamApi;