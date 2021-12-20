const ApiUtils = require('../apiUtils');
const fs = require('fs');

let pgClient;
let csv_path_dir = '/import_datasets/';

init();

function init(){
    (async() => {
        await importToPostgres().then(async() =>{
            pgClient.end();
        })
    })();
}

async function importToPostgres(){

    var createTableQueries = fs.readFileSync('create_tables_import.sql').toString();
    var populateQueries = fs.readFileSync('populate_postgres.sql').toString();

    pgClient = await ApiUtils.getPostgreSQLConnection();

    console.log('Connected to PostgreSQL database');
    
    //creation of all tables needed to import the csv files
    await pgClient.query(createTableQueries)
    .catch((e) => {
        console.log(`Error on creating import tables: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    console.log('Import tables created');
    
    //import process of csv files to PostgreSQL

    await pgClient.query(`COPY tmp_team FROM '${csv_path_dir}teams_fifa22.csv' DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on creating import tables: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    await pgClient.query(`COPY tmp_player FROM '${csv_path_dir}players_fifa22.csv' DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on import of file players_fifa22.csv: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    await pgClient.query(`COPY tmp_history_17 FROM '${csv_path_dir}FIFA17_official_data.csv' DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on import of file FIFA17_official_data.csv: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    await pgClient.query(`COPY tmp_history_18 FROM '${csv_path_dir}FIFA18_official_data.csv' DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on import of file FIFA18_official_data.csv: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    await pgClient.query(`COPY tmp_history_19 FROM '${csv_path_dir}FIFA19_official_data.csv' DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on import of file FIFA19_official_data.csv: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    await pgClient.query(`COPY tmp_history_20 FROM '${csv_path_dir}FIFA20_official_data.csv' DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on import of file FIFA20_official_data.csv: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    await pgClient.query(`COPY tmp_history_21 FROM '${csv_path_dir}FIFA21_official_data.csv' DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on import of file FIFA21_official_data.csv: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

 
    console.log('Csv Files successfully imported');

    //populate and manage imported data from csv files
    await pgClient.query(populateQueries)
    .catch((e) => {
        console.log(`Error on population of tables: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    //generate csv files needed for neo4j import process
    await pgClient.query(`COPY history TO '${csv_path_dir}players_history.csv' DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on creation of file players_history.csv : ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    await pgClient.query(`COPY (SELECT p.player_id as player_id, p.fullname as player_name, n.national_team_id as national_team_id, n.national_team_name as national_team_name, 2022 as year, p.nationality as player_nationality
        FROM national_team N JOIN player p ON p.national_team_id = n.national_team_id) TO '${csv_path_dir}players_national_teams_history.csv'
        DELIMITER ',' CSV HEADER;`)
    .catch((e) => {
        console.log(`Error on creation of file players_national_teams_history.csv: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    console.log('Csv files for Neo4j generated');

    //drop table after generating the csv files
    await pgClient.query(`DROP TABLE history`)
    .catch((e) => {
        console.log(`Error on dropping history table: ${e}`);
        pgClient.end();
        process.exit(-1);
    });

    console.log('Successfull import to PostgreSQL');
}