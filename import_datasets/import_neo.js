const ApiUtils = require('../apiUtils');

importToNeo();

async function importToNeo(){
    let neoSession;
    neoSession = await ApiUtils.getNeo4JConnection();
    await neoSession
        //delete all data present to avoid mismatch results
        .run('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n, r')
        .then(async () => {
            //create player nodes
            await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_history.csv\' AS row MERGE (p:Player{player_id:row.player_id,name:row.player_name,nationality:row.player_nationality});');
        })
        .then(async()=> {
            //create team nodes
            await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_history.csv\' AS row WITH row WHERE NOT row.team_name IS null MERGE (t:Team{team_id:row.team_id,name:row.team_name})')
        })
        .then(async()=> {
            //create national team nodes
            await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_national_teams_history.csv\' AS row MERGE (n:NationalTeam{national_team_id:row.national_team_id,name:row.national_team_name});')
        })
        .then(async()=>{
            //create relation represents
            await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_national_teams_history.csv\' AS row MATCH (p:Player{player_id:row.player_id}) MATCH (n:NationalTeam{national_team_id:row.national_team_id}) MERGE (p)-[r:represents{year:row.year}]->(n)')
        })
        .then(async()=>{ 
            //create relation played_in
            await neoSession.run('LOAD CSV WITH HEADERS FROM \'file:///players_history.csv\' AS row WITH row WHERE NOT row.team_name IS null MATCH (p:Player{player_id:row.player_id}) MATCH (t:Team{team_id:row.team_id}) MERGE (p)-[pi:played_in{year:row.year}]->(t)')
        })
        .then(async() => {
            await neoSession.close();
        });
        return;

}
