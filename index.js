const express = require('express');
const cors = require('cors');

var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

const app = express();

//IMPORTS 

const PlayerApi = require('./player');
const ApiUtils = require('./apiUtils');
const TeamApi = require('./team');
const NationalTeamApi = require('./nationalTeam');



app.use(express.json());
app.use(cors())
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


let PAGE_SIZE = 3;

// //BD CONNECTION FUNCTION

let pgClient;
let neoClient;

startDbConnection();

async function startDbConnection(){
    pgClient = await ApiUtils.getPostgreSQLConnection();
    neoClient = ApiUtils.getNeo4JConnection();
}

//ERROR MESSAGE FUNCTION

function generateError( string ){
    let answer ={};
    answer.message = string.replace(/"/g, '\'');
    return JSON.stringify(answer);
}

//API ENDPOINTS

    //Player endpoints

app.get('/api/players/nationalityPartners', async (req,res)=>{
    
    //Limit default
    let playersLimit = 3;
    
    const playerString = req.query.player;
    if (playerString == undefined)
        return res.status(400).send(generateError("Missing player parameter"));

    const limitString = req.query.limit;
    const limitNumber = parseInt(limitString);
    if (limitString != undefined && (isNaN(limitNumber) || limitNumber < 1))
        return res.status(400).send(generateError("Invalid limit value, should be a positive integer"));

    let query = "MATCH (p2:Player)-[y2:played_in]-(playedInTeam:Team)-[y1:played_in]-(p1:Player {name:'" + playerString + "'})--(nTeam:NationalTeam) " +
    "WHERE p2.nationality = p1.nationality  AND p1 <> p2 AND y1.year = y2.year " +
    "MATCH (p2) " +
    "WHERE NOT (p2:Player)--(nTeam:NationalTeam) " +
    "RETURN DISTINCT p2 " +
    "ORDER BY p2.name ";

    if (limitString != undefined){
        playersLimit = limitNumber;
    }
        
    query = query + "LIMIT " + playersLimit + ";";

    const neo4jSession = neoClient.session();

    let players = [];
    try {
        await neo4jSession.run(query)
        .then(function(result){
            result.records.forEach(function(record){
                players.push({
                    "player_id" : parseInt(record._fields[0].properties.player_id),
                    "name" : record._fields[0].properties.name
                });
            });
        })
    }
    catch( err ) {
        console.log(err);
    }
    finally {
        neo4jSession.close();
    }

    res.send(players);
});

app.get('/api/players/similar',async(req,res)=>{
    res.setHeader("content-type", "application/json");

    const {error} = PlayerApi.validatePlayerPararms(req.query,1); 
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }

   //Put the page size default

   let pageSize = PAGE_SIZE;

   //Check if the limit is defined, and if it is, use that as pageSize

   if(req.query.limit!==undefined){
       pageSize = parseInt(req.query.limit);
   }

   //Get the count to calculate the total pages

   const playersCount = await PlayerApi.getCountPlayersSimilar(req.query.name,pgClient);

   const totalPages = Math.ceil(playersCount/pageSize);

   //If the page required is greater than the total, 400 is returned

   if(req.query.page!==undefined && parseInt(req.query.page)>totalPages){
       return res.status(400).send(generateError('Page number is greater than the total pages count'));
   }

    //Return the similar players with pagination
    const similarPlayersRows = await PlayerApi.getSimilarPlayersByName(req.query.name,req.query.page,pageSize,pgClient);
    putTeamsUrisInPlayers(similarPlayersRows,ApiUtils.getBaseUrl(req));

    res = ApiUtils.getPaginatedResponse(req,res,totalPages);

    res.send(similarPlayersRows);

});

app.get('/api/players/degrees', async (req,res)=>{
    
    //Limit default
    let playersLimit = 100;
    
    const playerString = req.query.player;
    if (playerString == undefined)
        return res.status(400).send(generateError("Missing player parameter"));

    const degreesString = req.query.degrees;
    if (degreesString == undefined)
        return res.status(400).send(generateError("Missing degrees parameter"));
    const degreesNumber = parseInt(degreesString);
    if (isNaN(degreesNumber) || degreesNumber < 1 || degreesNumber > 6)
        return res.status(400).send(generateError("Invalid degrees value, should be an integer between 1 and 6"));
    
    const limitString = req.query.limit;
    const limitNumber = parseInt(limitString);
    if (limitString != undefined && (isNaN(limitNumber) || limitNumber < 1))
        return res.status(400).send(generateError("Invalid limit value, should be a positive integer"));

    
    let query = "MATCH (player:Player {name:'" + playerString + "'})-[*1.." + 2*degreesNumber + "]-(p2:Player) " +   //2 * porque hay 2 saltos entre players
    "RETURN DISTINCT p2 ";

    if (limitString != undefined){
        playersLimit = limitNumber;
    }
        
    query = query + "LIMIT " + playersLimit + ";";

    const neo4jSession = neoClient.session();

    let players = [];
    try {
        await neo4jSession.run(query)
        .then(function(result){
            result.records.forEach(function(record){
                players.push({
                    "player_id" : parseInt(record._fields[0].properties.player_id),
                    "name" : record._fields[0].properties.name
                });
            });
        })
    }
    catch( err ) {
        console.log(err);
    }
    finally {
        neo4jSession.close();
    }

    res.send(players);
});

app.get('/api/players/:id',async(req,res)=>{
    res.setHeader("content-type", "application/json");

    //Check if the structure of the request params are ok, otherwise it returns 400
    const {error} = PlayerApi.validatePlayerPararms(req.params,2);
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }

    const playerRows = await PlayerApi.getPlayerById(req.params.id,pgClient);

    if(playerRows.length==0){
        res.status(404).send(generateError('The player with the current id does not exist'));
    }

    putTeamsUrisInPlayers(playerRows,ApiUtils.getBaseUrl(req));

    res.send(playerRows[0]);

});

app.get('/api/players', async(req,res)=>{
    res.setHeader("content-type", "application/json");

    const {error} = PlayerApi.validatePlayerPararms(req.query,0); 
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }

    //Put the page size default

    let pageSize = PAGE_SIZE;

    //Check if the limit is defined, and if it is, use that as pageSize

    if(req.query.limit!==undefined){
        pageSize = parseInt(req.query.limit);
    }

    //Get the count to calculate the total pages

    const playersCount = await PlayerApi.getCountPlayersByParam(req.query,pgClient);

    const totalPages = Math.ceil(playersCount/pageSize);

    //If the page required is greater than the total, 400 is returned

    if(req.query.page!==undefined && parseInt(req.query.page)>totalPages){
        return res.status(400).send(generateError('Page number is greater than the total pages count'));
    }

    //Make the query and return with pagination

    const rows = await PlayerApi.getPlayersByParams(req.query,pgClient,pageSize);
    putTeamsUrisInPlayers(rows,ApiUtils.getBaseUrl(req));

    res = ApiUtils.getPaginatedResponse(req,res,totalPages);

    res.send(rows);
});

    //Team endpoints


app.get('/api/teams/recommended', async (req,res)=>{
    
    //Limit default
    let teamsLimit = 3;
    
    const playerString = req.query.player;
    if (playerString == undefined)
        return res.status(400).send(generateError("Missing player parameter"));

    const limitString = req.query.limit;
    const limitNumber = parseInt(limitString);
    if (limitString != undefined && (isNaN(limitNumber) || limitNumber < 1))
        return res.status(400).send(generateError("Invalid limit value, should be a positive integer"));


    let query = "MATCH (player:Player {name:'" + playerString + "'})-[:played_in {year: '2022'}]-(:Team)--(p2:Player) " +
    "WHERE player <> p2 " +
    "MATCH (player:Player)--(playedInTeam:Team) " +
    "WITH COLLECT(DISTINCT p2) as playedWith, COLLECT(DISTINCT playedInTeam) as playedInAlready " +
    "MATCH s = shortestPath((p:Player)-[:played_in]-(t:Team)) " +       //ShortestPath so as to count a player having played 4 years in a club
    "WHERE p IN playedWith AND NOT t IN playedInAlready " +             // only as 1 club apparition
    "RETURN t, COUNT(t) " +
    "ORDER BY COUNT(t) DESC ";


    if (limitString != undefined){
        teamsLimit = limitNumber;
    }
        
    query = query + "LIMIT " + teamsLimit + ";";

    const neo4jSession = neoClient.session();

    let clubs = [];
    try {
        await neo4jSession.run(query)
        .then(function(result){
            result.records.forEach(function(record){
                clubs.push({
                    "club_id" : parseInt(record._fields[0].properties.team_id),
                    "club" : record._fields[0].properties.name,
                    "timesMatched" : record._fields[1].low 
                });
            });
        })
    }
    catch( err ) {
        console.log(err);
    }
    finally {
        neo4jSession.close();
    }

    res.send(clubs);
});


app.get('/api/teams/:id',async(req,res)=>{
    res.setHeader("content-type", "application/json");

    //Check if the structure of the request params are ok, otherwise it returns 400
    const {error} = TeamApi.validateTeamPararms(req.params,1);
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }

    const teamRows = await TeamApi.getTeamById(req.params.id,pgClient);

    if(teamRows.length==0){
        res.status(404).send(generateError('The team with the current id does not exist'));
    }

    res.send(teamRows[0]);

});

app.get('/api/teams', async(req,res)=>{
    res.setHeader("content-type", "application/json");

     //Check if the structure of the query params are ok, otherwise it returns 400
     const {error} = TeamApi.validateTeamPararms(req.query,2);
     if(error){
      //400 Bad Request
      return res.status(400).send(generateError(error.details[0].message));
     }

    //Put the page size default

    let pageSize = PAGE_SIZE;

    //Check if the limit is defined, and if it is, use that as pageSize

    if(req.query.limit!==undefined){
        pageSize = parseInt(req.query.limit);
    }

    //Get the count to calculate the total pages

    const teamsCount = await TeamApi.getCountTeams(pgClient);

    const totalPages = Math.ceil(teamsCount/pageSize);

    //If the page required is greater than the total, 400 is returned

    if(req.query.page!==undefined && parseInt(req.query.page)>totalPages){
        return res.status(400).send(generateError('Page number is greater than the total pages count'));
    }

    //Check if the values of the query params are ok, otherwise it returns 400
    const teamSortByParametersValid = TeamApi.validateTeamSortByParams(req.query,false);

    if(!teamSortByParametersValid){
        return res.status(400).send(generateError('Invalid parameters for teams'));
    }

    //Make the query and return with pagination

    const teamRows = await TeamApi.getTeams(req.query,pgClient,pageSize);

    res = ApiUtils.getPaginatedResponse(req,res,totalPages);

    res.send(teamRows);
});

    //National team endpoints

app.get('/api/nationalTeams/:id',async(req,res)=>{
    res.setHeader("content-type", "application/json");

    //Check if the structure of the request params are ok, otherwise it returns 400
    const {error} = NationalTeamApi.validateNationalTeamPararms(req.params,0);
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }

    const teamRows = await NationalTeamApi.getNationalTeamById(req.params.id,pgClient);

    if(teamRows.length==0){
        res.status(404).send(generateError('The national team with the current id does not exist'));
    }

    res.send(teamRows[0]);

});

app.get('/api/nationalTeams', async(req,res)=>{
    res.setHeader("content-type", "application/json");

     //Check if the structure of the query params are ok, otherwise it returns 400
     const {error} = NationalTeamApi.validateNationalTeamPararms(req.query,1);
     if(error){
      //400 Bad Request
      return res.status(400).send(generateError(error.details[0].message));
     }

    //Put the page size default

    let pageSize = PAGE_SIZE;

    //Check if the limit is defined, and if it is, use that as pageSize

    if(req.query.limit!==undefined){
        pageSize = parseInt(req.query.limit);
    }

    //Get the count to calculate the total pages

    const nationalTeamsCount = await NationalTeamApi.getCountNationalTeams(pgClient);

    const totalPages = Math.ceil(nationalTeamsCount/pageSize);

    //If the page required is greater than the total, 400 is returned

    if(req.query.page!==undefined && parseInt(req.query.page)>totalPages){
        return res.status(400).send(generateError('Page number is greater than the total pages count'));
    }

    //Make the query and return with pagination

    const nationalTeamRows = await NationalTeamApi.getNationalTeams(req.query,pgClient,pageSize);

    res = ApiUtils.getPaginatedResponse(req,res,totalPages);

    res.send(nationalTeamRows);
});

    //League endpoints

app.get('/api/leagues', async(req,res)=>{
    res.setHeader("content-type", "application/json");

    //Check if the structure of the query params are ok, otherwise it returns 400
    const {error} = TeamApi.validateTeamPararms(req.query,0);
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }

    //Check if the values of the query params are ok, otherwise it returns 400
    const leagueSortByParametersValid = TeamApi.validateTeamSortByParams(req.query,true);


    if(!leagueSortByParametersValid){
        return res.status(400).send(generateError('Invalid parameters for the league\'s top'));
    }

    const topLeaguesRows = await TeamApi.getTopLeagues(req.query,pgClient);

    res.send(topLeaguesRows);

});


//Function to put team and national team uri's in players
    
function putTeamsUrisInPlayers(players,url){

    //Put the team and national team uri instead the property if they are not null

    players.forEach(player=>{
        if(player.team_id!=null){
            player.team_uri = url.concat(`/api/teams/${player.team_id}`);
        }
        if(player.national_team_id!=null){
            player.national_team_uri = url.concat(`/api/nationalTeams/${player.national_team_id}`);
        }
        delete player.national_team_id;
        delete player.team_id;
    });
}


//PORT
const port = process.env.PORT || 3000 ;
app.listen(port, ()=>console.log(`Listening to port ${port} . . .`));
