# FInest Football Analyzer (FIFA)

## 72.41 - Base de Datos II - 2º cuatrimestre 2021 - Final 22/12/2021 - Grupo Round Robin

### Instituto Tecnológico de Buenos Aires (ITBA)

## Autores

- [Sicardi, Julián Nicolas](https://github.com/Jsicardi) - Legajo 60347
- [Quintarios, Juan Ignacio](https://github.com/juaniq99) - Legajo 59715
- [Revich, Igal Leonel](https://github.com/irevich) - Legajo 60390

## Indice
- [Autores](#autores)
- [Indice](#indice)
- [Compilacion](#compilacion)
- [Importacion de datasets](#importacion-de-datasets)
    - [Importacion de datos a PostgreSQL con Docker](#importacion-de-datos-a-postgresql-con-docker)
    - [Importacion de datos a PostgreSQL local](#importacion-de-datos-a-postgresql-local)
    - [Importacion de datos a Neo4j con Docker](#importacion-de-datos-a-neo4j-con-docker)
    - [Importacion de datos a Neo4j local](#importacion-de-datos-a-neo4j-local)

## Compilacion

El proyecto se compila ejecutando el siguiente comando posicionado en la carpeta raiz de este: 

```bash
$ npm install
```

## Importacion de datasets

1. Descargar los datasets `players_fifa22.csv.zip` y `teams_fifa22.csv.zip` desde [https://www.kaggle.com/cashncarry/fifa-22-complete-player-dataset] y guardarlos en el directorio `import_datasets`

2. Descargar los datasets `FIFA17_official_data.csv.zip` `FIFA18_official_data.csv.zip` `FIFA19_official_data.csv.zip` `FIFA20_official_data.csv.zip` `FIFA21_official_data.csv.zip` desde [https://www.kaggle.com/cashncarry/fifa-22-complete-player-dataset] y guardarlos en el directorio `import_datasets`

3. Descomprimir los .zip descargados(`FIFAXX_official_data.csv.zip`, `teams_fifa22.csv.zip` y `players_fifa22.csv.zip`) para obtener los csv 

El proyecto utiliza las bases de datos PostgreSQL y Neo4J. A continuacion se detalla la importacion a ambas bases de datos, tanto para uso local (instalado localmente) como el uso de un contenedor de Docker.

### Importacion de datos a PostgreSQL con Docker:

1. Modificar las credenciales asociadas a la base PostgreSQL en el archivo `apiUtils.js` en particular user, password host y url en el metodo `getPostgreSQLConnection` con los valores adecuados. En caso de no existir la base de datos soccer-analyzer, crearla.

2. Previamente debe iniciarse el contenedor y ejecutarse los siguientes comandos para pasar todos los archivos .csv al contenedor (concretamente al directorio `/import_datasets` para este ejemplo) necesarios para la importacion (posicionado en el directorio `import_datasets` usado en los pasos anteriores):

```bash
$ docker cp my_file.csv  my_postgres_container:/import_datasets
```

3. Desde su host local ejecutar `import_postgres.js` en el directorio `import_datasets` local de la siguiente manera:

```bash
$ npm install
$ node import_postgres.js
```

4.  Al final de la importacion se mostrata el mensaje "Successfully imported to PostgreSQL". Adicional a la importacion de los datos a la base PostgreSQL, tambien se generan dos archivos `players_history.csv` y `players_national_teams_history.csv`, que se utilizaran a continuacion para la importacion a Neo4j. Estos se encuentran en el directorio `/import_datasets` dentro de su contenedor de docker.

> NOTA: en caso de querer modificar el path usado dentro del contenedor, ver el punto 1 de [Importacion de datos a PostgreSQL local](#importacion-de-datos-a-postgreSQL-local)

### Importacion de datos a PostgreSQL local:

1. Modificar las credenciales asociadas a la base PostgreSQL en el archivo `apiUtils.js` en particular user, password host y url en el metodo `getPostgreSQLConnection` con los valores adecuados. En caso de no existir la base de datos soccer-analyzer, crearla.

2. Abrir el archivo import_postgres.js y agregar el path absoluto hacia la carpeta `import-datasets`, modificando la variable `csv_path_dir`. Importante: corregir el caracter `\` con la orientacion correcta segun el sistema operativo, y no olvidar agregar una ultima `\` o `/` (segun sea adecuado) en el final del path.

3. Ejecutar `import_postgres.js` en el directorio `import-datasets` de la siguiente manera:

```bash
$ npm install
$ node import_postgres.js
```

4. Al final de la importacion se mostrata el mensaje "Successfully imported to PostgreSQL". Adicional a la importacion de los datos a la base PostgreSQL, tambien se generan dos archivos `players_history.csv` y `players_national_teams_history.csv`, visibles en el mismo directorio donde se ejecuto el comando anterior.

### Importacion de datos a Neo4j con Docker:

1. Modificar las credenciales asociadas a la base Neo4j en el archivo `apiUtils.js` path, usuario y password en el metodo `getNeo4JConnection` con los valores adecuados.

2. Exportar los csv creados en el proceso anterior (`players_history.csv` y `players_national_teams_history.csv`) al host local posicionado en el directorio `import-datasets` del host local, usando los comandos (cambiar el path utilizado en caso que se modifico este como menciona la nota de la seccion [Importacion de datos a PostgreSQL con Docker](#importacion-de-datos-a-postgreSQL-con-docker)):

```bash 
$ docker cp my_potgres_container:/import_datasets/players_history.csv .
$ docker cp my_potgres_container:/import_datasets/players_national_teams_history.csv .
```
3. Importar los datos al contenedor de Neo4j utilizado (que debe estar ya iniciado). Se debe respetar el path import/:

```bash 
$ docker exec -i my_neo_container sh -c 'cat > import/players_history.csv' < players_history.csv
$ docker exec -i my_neo_container sh -c 'cat > import/players_national_teams_history.csv' < players_national_teams_history.csv
```

4. Ejecutar el script import_neo.js posicionado siempre en el directorio `import-datasets` usando los comandos:

```bash    
$ npm install
$ node import_neo.js
```

5. Al finalizar la importacion se mostrara el mensaje "Successfully imported to Neo4j" en la consola, dando por finalizada la importacion.

### Importacion de datos a Neo4j local:

1. Modificar las credenciales asociadas a la base Neo4j en el archivo `apiUtils.js` path, usuario y password en el metodo `getNeo4JConnection` con los valores adecuados.

2. Mover los archivos `players_history.csv` y `players_national_teams_history.csv` al directorio correspondiente de Neo4j (/import).

3. Ejecutar luego los siguientes comandos:
    npm install
    node import_neo.js

4. Al finalizar la importacion se mostrara el mensaje "Successfully imported to Neo4j" en la consola, dando por finalizada la importacion.