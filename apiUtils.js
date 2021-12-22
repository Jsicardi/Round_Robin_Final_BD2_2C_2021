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

    static getNeo4JConnection(){
        return neo4j.driver('bolt://localhost:7687',neo4j.auth.basic('neo4j',''));
    }

    static getBaseUrl(req){
        const protocol = req.protocol;
        const host = req.hostname;
        const port = process.env.PORT || 3000;
      
        return `${protocol}://${host}:${port}`;
    }

    static getPaginatedResponse(req,res,totalPages){

        let originalUrl = req.originalUrl;
        
        if(totalPages!==0){
            const fullUrl = ApiUtils.getBaseUrl(req).concat(originalUrl);

            //Get url with params

            let urlParams = new URL(fullUrl);
            let searchParams = urlParams.searchParams;

            //Set "first" and "last" header link

            //first
            searchParams.set('page', '1');
            urlParams.search = searchParams.toString();
            let urlFirstLink = urlParams.toString();

            res.append("Link",`<${urlFirstLink}>; rel="first"`);

            //last
            searchParams.set('page', totalPages);
            urlParams.search = searchParams.toString();
            let urlLastLink = urlParams.toString();

            res.append("Link",`<${urlLastLink}>; rel="last"`);

            //Set "next" and "prev" header link

            //prev
            if(req.query.page!==undefined && parseInt(req.query.page)!==1){
                searchParams.set('page', parseInt(req.query.page)-1);
                urlParams.search = searchParams.toString();
                let urlPrevLink = urlParams.toString();
                res.append("Link",`<${urlPrevLink}>; rel="prev"`);
            }

            //next
            if(req.query.page===undefined || parseInt(req.query.page)!==totalPages){
                let nextPage = 2;
                if(req.query.page!==undefined){
                    nextPage = parseInt(req.query.page)+1;
                }
                searchParams.set('page', nextPage);
                urlParams.search = searchParams.toString();
                let urlNextLink = urlParams.toString();
                res.append("Link",`<${urlNextLink}>; rel="next"`);
            }
            
        }
    
        return res;

    }



}

module.exports = ApiUtils;