# Round_Robin_Final_BD2_2C_2021

Instrucciones para uso local:

Descargar los datasets players_fifa22.csv.zip y teams_fifa22.csv desde https://www.kaggle.com/cashncarry/fifa-22-complete-player-dataset y guardarlos en el directorio /import_datasets

Descargar los datasets FIFA17_official_data.csv.zip FIFA18_official_data.csv.zip FIFA19_official_data.csv.zip FIFA20_official_data.csv.zip FIFA21_official_data.csv.zip desde https://www.kaggle.com/cashncarry/fifa-22-complete-player-dataset y guardarlos en el directorio /import_datasets

Descomprimir los .zip descargados para obtener los csv y eliminar luego los archivos .zip remanentes

El proyecto utiliza las bases de datos PostgreSQL y Neo4J.

Importacion de datos a PostgreSQL con docker:

Previamente debe iniciarse el contenedor y ejecutarse el siguiente comando para pasar los archivos al contenedor necesarios para la importacion (posicionado en el directorio donde se descargaron los datasets previos):
    docker cp .  my_postgres_container:/import_datasets

Luego desde su host local ejecutar import_postgres.js de la siguiente manera:
    node import_postgres.ja

Adicional a la importacion de los datos a la base, tambien se generan dos archivos players_history.csv y players_national_teams_history.csv, que se utilizaran a continuacion para la importacion a neo4j

Importacion de datos a PostgreSQL local:

Los pasos de la importacion son los mismos, pero es importante que previamente se modifique el path de los archivos csv en import_postgres.js, modificando el path presente por el path absoluto de la carpeta import_datasets que contiene los archivos csv. En esta carpeta tambien se veran creados los csv resultantes para la importacion a Neo4j

Importacion de datos a Neo4j con docker:

Exportar los csv creados en el proceso anterior (players_history.csv y players_national_teams_history.csv) al host local usando el comando:
    docker cp my_potgres_container:/import_datasets/players_history.csv .
    docker cp my_potgres_container:/import_datasets/players_national_teams_history.csv .

Importar los datos al contenedor de Neo4j utilizado (que debe estar ya iniciado)
    docker exec -i my_neo_container sh -c 'cat > import/players_history.csv' < players_history.csv
    docker exec -i my_neo_container sh -c 'cat > import/players_national_teams_history.csv' < players_national_teams_history.csv

Ejecutar el script import_neo.js usando los comandos:
    npm install
    node import_neo.js

Importacion de datos a Neo4j local:

En este caso mover los archivos players_history.csv y players_national_teams_history.csv al directorio correspondiente de Neo4j (/import) y ejecutar luego los comandos:
    npm install
    node import_neo.js