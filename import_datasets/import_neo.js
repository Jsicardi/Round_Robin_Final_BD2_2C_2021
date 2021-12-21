const ApiUtils = require('../apiUtils');

let neoDriver;
let neoSession;

init();

function init(){
    (async() => {
        await importToNeo().then(() =>{
            neoSession.close();
            neoDriver.close();
            console.log('Successfully imported to Neo4j');
        })
    })();
}

async function importToNeo(){
    neoDriver = await ApiUtils.getNeo4JConnection();
      //delete all data present to avoid mismatch results
    
    neoSession = neoDriver.session();
    await neoSession.run('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r')
    .then(async () => {
        console.log('Database cleaned')
         //create player nodes
        neoSession.close();
        neoSession = neoDriver.session();
        await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_history.csv\' AS row MERGE (p:Player{player_id:row.player_id,name:row.player_name,nationality:row.player_nationality});')
            .catch((e) => {
                console.log(`Error on creating player nodes: ${e}`);
                neoSession.close();
                process.exit(-1);
            });
        })
    .then(async()=> {
        console.log('Player nodes created')
        //create team nodes
        neoSession.close();
        neoSession = neoDriver.session();
        await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_history.csv\' AS row WITH row WHERE NOT row.team_name IS null MERGE (t:Team{team_id:row.team_id,name:row.team_name})')
        .catch((e) => {
            console.log(`Error on creating team nodes: ${e}`);
            neoSession.close();
            process.exit(-1);
        });
    })
    .then(async()=> {

        console.log('Team nodes created')
        //create national team nodes
        neoSession.close();
        neoSession = neoDriver.session();
        await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_national_teams_history.csv\' AS row MERGE (n:NationalTeam{national_team_id:row.national_team_id,name:row.national_team_name});')
        .catch((e) => {
            console.log(`Error on creating national teams nodes: ${e}`);
            neoSession.close();
            process.exit(-1);
        });
    })
    .then(async()=>{
        console.log('National team nodes created')
        //create relation represents
        neoSession.close();
        neoSession = neoDriver.session();
        await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_national_teams_history.csv\' AS row MATCH (p:Player{player_id:row.player_id}) MATCH (n:NationalTeam{national_team_id:row.national_team_id}) MERGE (p)-[r:represents{year:row.year}]->(n)')
        .catch((e) => {
            console.log(`Error on creating represent relations: ${e}`);
            neoSession.close();
            process.exit(-1);
        });
    })
    .then(async()=>{
        console.log('Represents relations created') 
        //create relation played_in
        neoSession.close();
        neoSession = neoDriver.session();
        await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_history.csv\' AS row WITH row WHERE NOT row.team_name IS null MATCH (p:Player{player_id:row.player_id}) MATCH (t:Team{team_id:row.team_id}) MERGE (p)-[pi:played_in{year:row.year}]->(t)')
        .catch((e) => {
            console.log(`Error on creating played_in relations: ${e}`);
            neoSession.close();
            process.exit(-1);
        });
    })
}
