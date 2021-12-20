const Joi = require('joi');

class TeamApi {

    static async getTopLeagues(params,client){
        
        const limitParam = params.limit;
        
        //Define limit default
        const limitDefault = 3;
        let limit = limitDefault;

        //Check if limit query param is defined
        if(limitParam!==undefined){
            limit = parseInt(limitParam);
        }

        let query = "SELECT league,COUNT(team_id) AS team_count,ROUND(AVG(transfer_budget),2) AS total_transfer_budget,ROUND(AVG(team_average_age)) AS average_age, COUNT(player_id) AS national_team_players_count FROM team NATURAL JOIN player WHERE national_team_id IS NOT NULL GROUP BY league ORDER BY ";

        if(params.sortBy!==undefined){
            const sortByParam = params.sortBy.toLowerCase();
            switch(sortByParam){
                case 'transferbudget':
                    query = query.concat("total_transfer_budget DESC ");
                    break;
                case 'teamaverageage':
                    // query = "SELECT league,ROUND(AVG(team_average_age)) AS average_age FROM team GROUP BY league ORDER BY average_age DESC ";
                    query = query.concat("average_age DESC ");
                    break;
                case 'nationalteamplayers':
                    query = query.concat("national_team_players_count DESC ");
                    break;
            }
        }
        else{
            query = query.concat("team_count DESC ");
        }

        query = query.concat(`LIMIT ${limit}`);

        try{
            const results = await client.query(query);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }

        
    }

    static validateTopLeaguesParams(params){
        if(params.sortBy!==undefined){
            
            const sortByValue = params.sortBy.toLowerCase();

            //Check if the parameter is one of the sortBy values

            const topLeaguesSortByParameters = ['transferBudget','teamAverageAge','nationalTeamPlayers'];

            let i;
            let elem;
            for(i=0;i<topLeaguesSortByParameters.length;i++){
                elem = topLeaguesSortByParameters[i].toLowerCase();
                if(sortByValue===elem.toLowerCase()){                    
                    return true;
                }
            }

            //if the parameter has an invalid value, returns false
            return false;

        }

        //Finally, if the sortBy is undefined, it use the default order, so returns true

        return true;
    }

        //ValidateTeamQueryParams
    //0-/api/leagues
    static validateTeamPararms(params,index){
    
        let schema;
        
        switch(index){
            case 0:
                schema = { 
                    sortBy : Joi.string(),
                    page : Joi.number().min(1),
                    limit : Joi.number().min(1)
                };
                break;
            
    
        }

        return Joi.validate(params,schema);
    }

}

module.exports = TeamApi;