const express = require('express');

const app = express();


//IMPORTS 

const PlayerApi = require('./player');
const ApiUtils = require('./apiUtils');
const TeamApi = require('./team');


app.use(express.json());


// //BD CONNECTION FUNCTION

let pgClient;
let neoSession;

startDbConnection();

async function startDbConnection(){
    pgClient = await ApiUtils.getPostgreSQLConnection();
    neoSession = await ApiUtils.getNeo4JConnection();
}

//ERROR MESSAGE FUNCTION

function generateError( string ){
    let answer ={};
    answer.message = string;
    return JSON.stringify(answer);
}

//API ENDPOINTS 

app.get('/api/players', async(req,res)=>{
    res.setHeader("content-type", "application/json");

    const {error} = PlayerApi.validatePlayerPararms(req.query,0); 
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }

    const rows = await PlayerApi.getPlayersByParams(req.query,pgClient);

    res.send(rows);
});

app.get('/api/players/similar',async(req,res)=>{
    res.setHeader("content-type", "application/json");

    const {error} = PlayerApi.validatePlayerPararms(req.query,1); 
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }


    //Replace the consecutive white-space characters a single white-space
    let playerName = req.query.name.replace(/\s+/g, " ");
    
    //Remove the white-space characters at the beginning and at the end of the name
    playerName = playerName.replace(/^\s+|\s+$/g, "");

    //Check if it exists a player in BD with that name
    const playerRows = await PlayerApi.getPlayerByName(playerName,pgClient);
    
    //If it does not exist, a 404 error is returned
    if(playerRows.length == 0){
        return res.status(404).send(generateError("The player with the current name does not exist"));
    }

    //Otherwise, return the similar players
    const similarPlayersRows = await PlayerApi.getSimilarPlayersByName(playerName,req.query.page,req.query.limit,pgClient);


    res.send(similarPlayersRows);

});

app.get('/api/leagues', async(req,res)=>{
    res.setHeader("content-type", "application/json");

    //Check if the structure of the query params are ok, otherwise it returns 400
    const {error} = TeamApi.validateTeamPararms(req.query,0);
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(error.details[0].message));
    }

    //Check if the values of the query params are ok, otherwise it returns 400
    const leagueParametersValid = TeamApi.validateTopLeaguesParams(req.query);

    console.log(`leagueParametersValid : ${leagueParametersValid}`);

    if(!leagueParametersValid){
        return res.status(400).send(generateError('Invalid parameters for the league\'s top'));
    }

    //If nationality query param is defined, check if it exists, otherwise return 404
    if(req.query.nationality!==undefined){
        const nationality = req.query.nationality.toLowerCase();
        const playerNationalityRows = await PlayerApi.getPlayersByNationality(nationality,pgClient);
        if(playerNationalityRows.length==0){
            return res.status(404).send(generateError("Players with the current nationality do not exist"));
        }
    }

    
    const topLeaguesRows = await TeamApi.getTopLeagues(req.query,pgClient);

    res.send(topLeaguesRows);

});

app.get('/api/teams', async(req,res)=>{
    const rows = await (await pgClient.query("SELECT * FROM team WHERE league='Argentina Primera División'")).rows;
    res.send(JSON.stringify(rows));
});

app.get('/api/playersNeo', async (req,res)=>{
    let players = [];
     await neoSession
        .run('MATCH (p:Player)-[r:represents]->(nt:NationalTeam{name:\'Argentina\'}) return p LIMIT 25')
        .then(function(result){
            result.records.forEach(function(record){
                console.log(record._fields[0].properties);
                // console.log('Players antes')
                players.push({
                    "playerId" : record._fields[0].properties.player_id,
                    "name" : record._fields[0].properties.name
                });
                // console.log('Players despues')
            });
        })
        .catch(function(err){
            console.log(err);
        })
    // console.log(players);    
    res.send(players);
});

app.get('/api/teams/recommended', async (req,res)=>{
    const playerString = req.query.player;
    if (playerString == undefined)
        return res.status(400).send(generateError("Missing player parameter"));


    let clubs = [];
     await neoSession
        .run("MATCH (player:Player {name:'" + playerString + "'})-[:played_in {year: '2022'}]-(playedInTeam:Team)--(p2:Player) " +
        "WHERE player <> p2 " +
        "WITH COLLECT(DISTINCT p2) as playedWith, COLLECT(DISTINCT playedInTeam) as playedInAlready " +
        "MATCH s = shortestPath((p:Player)-[:played_in]-(t:Team)) " +       //ShortestPath so as to count a player having played 4 years in a club
        "WHERE p IN playedWith AND NOT t IN playedInAlready " +             // only as 1 club apparition
        "RETURN t, COUNT(t) " +
        "ORDER BY COUNT(t) DESC;")
        .then(function(result){
            result.records.forEach(function(record){
                clubs.push({
                    "club" : record._fields[0].properties.name,
                    "timesMatched" : record._fields[1].low 
                });
            });
        })
        .catch(function(err){
            console.log(err);
        })
    res.send(clubs);
});

app.get('/api/players/nationalityPartners', async (req,res)=>{
    const playerString = req.query.player;
    if (playerString == undefined)
        return res.status(400).send(generateError("Missing player parameter"));


    let players = [];
     await neoSession
        .run("MATCH (p2:Player)-[y2:played_in]-(playedInTeam:Team)-[y1:played_in]-(p1:Player {name:'" + playerString + "'})--(nTeam:NationalTeam) " +
        "WHERE p2.nationality = p1.nationality  AND p1 <> p2 AND y1.year = y2.year " +
        "MATCH (p2) " +
        "WHERE NOT (p2:Player)--(nTeam:NationalTeam) " +
        "RETURN DISTINCT p2 " +
        "ORDER BY p2.name;")
        .then(function(result){
            result.records.forEach(function(record){
                players.push({
                    "name" : record._fields[0].properties.name
                });
            });
        })
        .catch(function(err){
            console.log(err);
        })
    res.send(players);
});

app.get('/api/players/degrees', async (req,res)=>{
    const playerString = req.query.player;
    if (playerString == undefined)
        return res.status(400).send(generateError("Missing player parameter"));
    const degreesString = req.query.degrees;
    if (degreesString == undefined)
        return res.status(400).send(generateError("Missing degrees parameter"));
    const degreesNumber = parseInt(degreesString);
    if (isNaN(degreesNumber) || degreesNumber < 1 || degreesNumber > 6)
        return res.status(400).send(generateError("Invalid degrees value, should be an integer between 1 and 6"));

    let players = [];
     await neoSession
        .run("MATCH (player:Player {name:'" + playerString + "'})-[*1.." + 2*degreesNumber + "]-(p2:Player) " +   //2 * porque hay 2 saltos entre players
        "RETURN DISTINCT p2;")
        .then(function(result){
            result.records.forEach(function(record){
                players.push({
                    "name" : record._fields[0].properties.name
                });
            });
        })
        .catch(function(err){
            console.log(err);
        })
    res.send(players);
});



//PORT
const port = process.env.PORT || 3000 ;
app.listen(port, ()=>console.log(`Listening to port ${port} . . .`));
