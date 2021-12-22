const Joi = require('joi');

class TeamApi {

    static async getTeamById(id,client){
        try{
            const results = await client.query(`SELECT * FROM team WHERE team_id=${id}`);
            return results.rows
        }
        catch(e){
            console.log(e);
        }
    }

    static async getTeams(params,client,pageSize){
        
        const limitParam = params.limit;
        const pageParam = params.page;
        
        //Define page default

        const pageDefault = 1;
        let page = pageDefault;
        let limit = pageSize;

        //Check if page and limit query params are defined
        if(pageParam!==undefined){
            page = parseInt(pageParam);
        }

        let query = "SELECT * FROM team ORDER BY ";

        if(params.sortBy!==undefined){
            const sortByParam = params.sortBy.toLowerCase();
            switch(sortByParam){
                case 'transferbudget':
                    query = query.concat("transfer_budget ");
                    break;
                case 'teamaverageage':
                    query = query.concat("team_average_age ");
                    break;
            }

            if (params.order == 'asc')
                query = query.concat("ASC ");
            else
                query = query.concat("DESC ");
        }
        else{
            query = query.concat("team_name ");
            if (params.order == 'desc')             //By team name ascending makes more sense as default
                query = query.concat("DESC ");
            else
                query = query.concat("ASC ");
        }

        query = query.concat(`LIMIT ${limit} OFFSET ((${page}-1) * ${limit})`);

        try{
            const results = await client.query(query);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }

    }

    static async getCountTeams(client){
        try{
            const results = await client.query(`SELECT COUNT(*) FROM team`);
            return results.rows[0].count;
        }
        catch(e){
            console.log(e);
        }

    }

    static async getTopLeagues(params,client){
        
        const limitParam = params.limit;
        
        //Define limit default
        const limitDefault = 3;
        let limit = limitDefault;

        //Check if limit query param is defined
        if(limitParam!==undefined){
            limit = parseInt(limitParam);
        }


        let query = "SELECT league,COUNT(distinct team_id) AS team_count,ROUND(AVG(transfer_budget),2) AS average_transfer_budget,ROUND(AVG(team_average_age)) AS average_age, p_count AS national_team_players_count FROM team NATURAL JOIN ( " + 
        "SELECT league, COUNT(player_id) as p_count FROM team NATURAL JOIN player WHERE national_team_id IS NOT NULL GROUP BY league) as aux GROUP BY league, p_count ORDER BY ";

        if(params.sortBy!==undefined){
            const sortByParam = params.sortBy.toLowerCase();
            switch(sortByParam){
                case 'transferbudget':
                    query = query.concat("average_transfer_budget ");
                    break;
                case 'teamaverageage':
                    query = query.concat("average_age ");
                    break;
                case 'nationalteamplayers':
                    query = query.concat("national_team_players_count ");
                    break;
            }
        }
        else{
            query = query.concat("team_count ");
        }

        if (params.order == 'asc')
            query = query.concat("ASC ");
        else
            query = query.concat("DESC ");

        query = query.concat(`LIMIT ${limit}`);

        try{
            const results = await client.query(query);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }

        
    }

    static validateTeamSortByParams(params,isLeague){
        if(params.sortBy!==undefined){
            
            const sortByValue = params.sortBy.toLowerCase();

            //Check if the parameter is one of the sortBy values

            let sortByParameters = ['transferBudget','teamAverageAge'];

            if(isLeague){
                sortByParameters.push('nationalTeamPlayers');
            }

            let i;
            let elem;
            let found = false;
            for(i=0; !found && i<sortByParameters.length; i++){
                elem = sortByParameters[i].toLowerCase();
                if(sortByValue===elem.toLowerCase()){                    
                    found = true;
                }
            }

            //if the parameter has an invalid value, returns false
            if (!found)
                return false;

        }

        if (params.order != undefined){
            const orderValue = params.order.toLowerCase();

            //Check if the parameter is one of the order values

            const topLeaguesOrderParameters = ['asc','desc'];

            let i;
            let elem;
            for(i=0;i<topLeaguesOrderParameters.length;i++){
                elem = topLeaguesOrderParameters[i].toLowerCase();
                if(orderValue===elem.toLowerCase()){                 
                    return true;
                }
            }

            //if the parameter has an invalid value, returns false
            return false;
        }

        //Finally, if the sortBy is undefined, it use the default order, so returns true
        return true;
    }

        //ValidateTeamParams
    //0-/api/leagues
    //1-/api/teams/:id
    //2-/api/teams
    static validateTeamPararms(params,index){
    
        let schema;
        
        switch(index){
            case 0:
                schema = { 
                    sortBy : Joi.string(),
                    limit : Joi.number().min(1),
                    order: Joi.string()
                };
                break;
            case 1:
                schema = {
                    id : Joi.number().min(0).required()
                }
                break;
            case 2:
                schema = { 
                    sortBy : Joi.string(),
                    page : Joi.number().min(1),
                    limit : Joi.number().min(1),
                    order: Joi.string()
                };
                break;
            
    
        }

        return Joi.validate(params,schema);
    }

}

module.exports = TeamApi;