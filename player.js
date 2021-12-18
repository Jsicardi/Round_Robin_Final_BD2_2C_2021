
class PlayerApi{

    static async getPlayersByParams(params,client){
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
        // if(params.nationalTeam!==undefined){
        //     if(paramsQuantity===0){
        //         query.concat("WHERE ")
        //     }
        //     else{
        //         query.concat("AND ")
        //     }
        //     if()
        //     query.concat(`nationality = ${params.nationality} `);
        //     paramsQuantity++;
        // }
        query = query.concat("ORDER BY total_score DESC ");
        if(params.limit!==undefined){
            query = query.concat(`LIMIT ${params.limit} `);
            if(params.page!==undefined){
                query = query.concat(`OFFSET ((${params.page}-1) * ${params.limit})`);
            }
        }
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