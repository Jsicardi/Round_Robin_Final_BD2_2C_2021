const neo4j = require('neo4j-driver');
const {Client} = require('pg');

class ApiUtils {

    static async getPostgreSQLConnection(){
        
        // PARA PROBAR BD LOCAL ( PONER PASSWORD)

        const client = new Client({
            user: "postgres",
            password: "",
            host: "localhost",
            port: 5433,
            database: "soccer_analyzer"
        });

        try{
            await client.connect();
            return client;
        }
        catch(e){
            console.error(`Failed to connect ${e}`)
        }


    }

    static async getNeo4JConnection(){
        const driver = neo4j.driver('bolt://localhost:7687',neo4j.auth.basic("admin", ""));
        return driver.session();
    }



}

module.exports = ApiUtils;