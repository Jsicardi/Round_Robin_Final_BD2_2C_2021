
class PlayerApi{

    static async getPlayersByParams(params,client){
        
        //Define limit and page default
        const limitDefault = 3;
        const pageDefault = 1;
        let page = pageDefault;
        let limit = limitDefault;

        let query = "SELECT player_id,fullname,age,photo_url as photo, nationality, total_score, positions, team_id, value_eur, contract_until, national_team_id, preferred_foot FROM player ";
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
        if(params.nationalTeam!==undefined){
            let playsInNationalTeam = params.nationalTeam.toLowerCase() === 'true';
            if(paramsQuantity===0){
                query = query.concat("WHERE ")
            }
            else{
                query = query.concat("AND ")
            }
            if(playsInNationalTeam){
                query = query.concat("national_team_id IS NOT NULL ");
            }
            else{
                query = query.concat("national_team_id IS NULL ");
            }
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
            console.log('Remaining time : '+remainingTime);
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

        if(params.limit!==undefined){
            limit = parseInt(params.limit);
        }
        if(params.page!==undefined){
            page = parseInt(params.page);
        }

        query = query.concat(`ORDER BY total_score DESC LIMIT ${limit} OFFSET ((${page}-1) * ${limit})`);


        console.log(query);
        try{
            const results = await client.query(query);
            return results.rows;
        }
        catch(e){
            console.log(e);
        }
        
    }

}

module.exports = PlayerApi;