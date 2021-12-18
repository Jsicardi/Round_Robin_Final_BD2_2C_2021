const express = require('express');

const app = express();


//IMPORTS 

const PlayerApi = require('./player');
const ApiUtils = require('./apiUtils');


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

function generateError( code , string ){
    let answer ={};
    answer.code = code;
    answer.message = string;
    return JSON.stringify(answer);
}

//API ENDPOINTS 

app.get('/api/players', async(req,res)=>{
    res.setHeader("content-type", "application/json");

    const {error} = PlayerApi.validatePlayerPararms(req.query,0); 
    if(error){
     //400 Bad Request
     return res.status(400).send(generateError(400, error.details[0].message));
    }

    const rows = await PlayerApi.getPlayersByParams(req.query,pgClient);

    res.send(rows);
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

app.get('/api/recommendedClubs', async (req,res)=>{
    const playerString = req.query.player;
    if (playerString == undefined)
        return res.status(400).send(generateError(400, "Missing player parameter"));


    let clubs = [];
     await neoSession
        .run("MATCH (player:Player {name:'" + playerString + "'})--(playedInTeam:Team)--(p2:Player) " +
        "WHERE player <> p2 " +
        "WITH player, COLLECT(DISTINCT p2) as playedWith, COLLECT(DISTINCT playedInTeam) as playedInAlready " +
        "MATCH (p:Player)--(t:Team) " +
        "WHERE p IN playedWith AND NOT t IN playedInAlready " +
        "RETURN DISTINCT t, COUNT(t) " +
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

//PORT
const port = process.env.PORT || 3000 ;
app.listen(port, ()=>console.log(`Listening to port ${port} . . .`));