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

    static async getNationalTeams(params,client){
        
        const limitParam = params.limit;
        const pageParam = params.page;
        
        //Define limit and page default
        const limitDefault = 3;
        const pageDefault = 1;
        let page = pageDefault;
        let limit = limitDefault;

        //Check if page and limit query params are defined
        if(pageParam!==undefined){
            page = parseInt(pageParam);
        }
        if(limitParam!==undefined){
            limit = parseInt(limitParam);
        }

        try{
            const results = await client.query(`SELECT * FROM national_team ORDER BY national_team_name LIMIT ${limit} OFFSET ((${page}-1) * ${limit})`);
            return results.rows;
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