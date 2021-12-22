const Joi = require('joi');

class PlayerApi{

    static async getPlayerById(id,client){
        try{
            const results = await client.query(`SELECT player_id,fullname,age,photo_url as photo, nationality, total_score, positions, best_position, team_id, value_eur, contract_until, national_team_id, preferred_foot, pace_total, shooting_total, passing_total, dribbling_total,defending_total, physicality_total FROM player WHERE player_id=${id}`);
            return results.rows
        }
        catch(e){
            console.log(e);
        }
    }

    static async getPlayersByParams(params,client,pageSize){
        
        //Define page default

        const pageDefault = 1;
        let page = pageDefault;
        let limit = pageSize;

        let query = "SELECT player_id,fullname,age,photo_url as photo, nationality, total_score, positions, best_position, team_id, value_eur, contract_until, national_team_id, preferred_foot, pace_total, shooting_total, passing_total, dribbling_total,defending_total, physicality_total FROM player ";
        let paramsQuantity = 0;
        if(params.age !== undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`age <= ${params.age} `);
            paramsQuantity++;
        }
        if(params.nationality!==undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`nationality = '${params.nationality}' `);
            paramsQuantity++;
        }
        if(params.preferredFoot!==undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`preferred_foot = '${params.preferredFoot}' `);
            paramsQuantity++;
        }
        if(params.valueEUR!==undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`value_eur <= ${params.valueEUR} `);
            paramsQuantity++;
        }
        if(params.position !== undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`'${params.position}'=ANY(positions) `);
            paramsQuantity++;
        }
        if(params.remainingTime!==undefined){
            const currentYear = new Date().getFullYear();
            const remainingTime = parseInt(params.remainingTime);

            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`(contract_until - ${currentYear}) >=0 AND (contract_until - ${currentYear}) <= ${remainingTime} `);
            paramsQuantity++;
        }

        if(params.name!==undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`metaphone('${params.name}',10) % metaphone(fullname,10) `);
            paramsQuantity++;
        }

        if(params.page!==undefined){
            page = parseInt(params.page);
        }

        query = query.concat("ORDER BY ");

        if(params.name!==undefined){
            query = query.concat(`SIMILARITY(metaphone('${params.name}',10),metaphone(fullname,10)) DESC, `);
        }

        query = query.concat(`total_score DESC LIMIT ${limit} OFFSET ((${page}-1) * ${limit})`);

        try{
            const results = await client.query(query);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }
        
    }

    static async getCountPlayersByParam(params,client){

        let query = "SELECT COUNT(*) FROM player ";
        let paramsQuantity = 0;
        if(params.age !== undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`age <= ${params.age} `);
            paramsQuantity++;
        }
        if(params.nationality!==undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`nationality = '${params.nationality}' `);
            paramsQuantity++;
        }
        if(params.preferredFoot!==undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`preferred_foot = '${params.preferredFoot}' `);
            paramsQuantity++;
        }
        if(params.valueEUR!==undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`value_eur <= ${params.valueEUR} `);
            paramsQuantity++;
        }
        if(params.position !== undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`'${params.position}'=ANY(positions) `);
            paramsQuantity++;
        }
        if(params.remainingTime!==undefined){
            const currentYear = new Date().getFullYear();
            const remainingTime = parseInt(params.remainingTime);

            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`(contract_until - ${currentYear}) >=0 AND (contract_until - ${currentYear}) <= ${remainingTime} `);
            paramsQuantity++;
        }

        if(params.name!==undefined){
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            query = query.concat(`metaphone('${params.name}',10) % metaphone(fullname,10) `);
            paramsQuantity++;
        }

        try{
            const results = await client.query(query);
            return results.rows[0].count;
        }
        catch(e){
            console.log(e);
        }
    }

    static async getSimilarPlayersByName(name,pageParam,pageSize,client){

        //Define page default

        const pageDefault = 1;
        let page = pageDefault;
        let limit = pageSize;

        //Check if page query param is defined
        if(pageParam!==undefined){
            page = parseInt(pageParam);
        }

        //Get the best result of fuzzy searching using the method 'getPlayerByParams()'

        let params = {};
        params.name = name;
        params.limit = 1;

        const fuzzySearchResultRows = await this.getPlayersByParams(params,client,pageSize);

        //Use the id of the player with most similar name to do the query

        const similarPlayerId = fuzzySearchResultRows[0].player_id;
        
        let query = `SELECT p.player_id,p.fullname,p.age,p.photo_url as photo, p.nationality, p.total_score, p.positions, p.best_position, p.team_id, p.value_eur, p.contract_until, p.national_team_id, p.preferred_foot, p.pace_total, p.shooting_total, p.passing_total, p.dribbling_total,p.defending_total, p.physicality_total
        FROM (SELECT player_id, best_position, pace_total, shooting_total, passing_total,
        dribbling_total,defending_total, physicality_total FROM player WHERE player_id=(SELECT player_id FROM player WHERE
        player_id = ${similarPlayerId})) as aux, player p WHERE p.best_position=aux.best_position AND p.player_id<>aux.player_id
        ORDER BY abs(p.pace_total-aux.pace_total) + abs(p.shooting_total-aux.shooting_total)
        + abs(p.passing_total-aux.passing_total) + abs(p.dribbling_total-aux.dribbling_total) + abs(p.defending_total-aux.defending_total)
        + abs(p.physicality_total-aux.physicality_total) LIMIT ${limit} OFFSET ((${page}-1) * ${limit})`;

        try{
            const results = await client.query(query);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }


    }

    static async getCountPlayersSimilar(name,client){

        //Get the best result of fuzzy searching using the method 'getPlayerByParams()'

        let params = {};
        params.name = name;
        params.limit = 1;

        const fuzzySearchResultRows = await this.getPlayersByParams(params,client,params.limit);

        //Use the id of the player with most similar name to do the query

        const similarPlayerId = fuzzySearchResultRows[0].player_id;
        
        let query = `SELECT COUNT(*)
        FROM (SELECT player_id, best_position, pace_total, shooting_total, passing_total,
        dribbling_total,defending_total, physicality_total FROM player WHERE player_id=(SELECT player_id FROM player WHERE
        player_id = ${similarPlayerId})) as aux, player p WHERE p.best_position=aux.best_position AND p.player_id<>aux.player_id`;

        try{
            const results = await client.query(query);
            return results.rows[0].count;
        }
        catch(e){
            console.log(e);
        }
    }

    static async getPlayerByName(name,client){  
        try{
            const results = await client.query(`SELECT * FROM player WHERE lower(fullname)=lower('${name}')`);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }
    }

    static async getPlayersByNationality(nationality,client){
        try{
            const results = await client.query(`SELECT * FROM player WHERE lower(nationality)=lower('${nationality}')`);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }
    }


    //ValidatePlayerParams
    //0-/api/players
    //1-/api/players/similar
    //2-/api/players/:id
    static validatePlayerPararms(params,index){
    
        let schema;
        
        switch(index){
            case 0:
                schema = { 
                    age: Joi.number().min(0),
                    nationality: Joi.string(), 
                    preferredFoot: Joi.string(),
                    valueEUR : Joi.number().min(0),
                    position : Joi.string(),
                    remainingTime : Joi.number().min(0),
                    name : Joi.string(),
                    page : Joi.number().min(1),
                    limit : Joi.number().min(1)
                };
                break;
            
            case 1:
                schema = {
                    name : Joi.string().required(),
                    page : Joi.number().min(1),
                    limit : Joi.number().min(1)
                };
                break;
            case 2:
                schema = {
                    id : Joi.number().min(0).required()
                };
                break;
        }


        return Joi.validate(params,schema);
    }


}


module.exports = PlayerApi;