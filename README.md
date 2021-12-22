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
- [Ejecucion de la API](#ejecucion-de-la-api)

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

## Ejecucion de la API

Antes de ejecutar la API, se debe tener en cuenta que previamente deben estar activas las bases de datos de Neo4J y Postgres a utilizar ( Por ejemplo, en caso de usar contenedores de dockers para las bases de datos, estos deben estar corriendo al momento de ejecutarse la API.)

Para ejecutar la misma, en el directorio raiz del proyecto se ejecutan los siguientes comandos 

```bash
$ npm install
$ node index.js
```

Una vez ejecutados estos, la API estara disponible en el puerto 3000 por default, o en el puerto donde se haya definido por terminal la variable de entorno "PORT". Por ejemplo, si se quiere que la API se ejecute en http://localhost:5000, deben realizarse alguno de los siguientes comandos dependiendo del sistema opertativo de la maquina donde se quiera correr la misma

- $env:PORT=5000 (Windows)
- export PORT=5000 (Linux/Mac)

Si no se define dicha variable de entorno, por default la API corre en http://localhost:3000

Dependiendo de en que puerto se este ejecutando la misma, se debe modificar la propiedad "host" en la linea 15 del documento "swagger.json", dado que el swagger debe ejecutarse en el mismo puerto local que la API (Por default esta es "localhost:3000")

Teniendo en cuenta todo esto, al correrse el comando de node mencionado previamente, en la consola se observara un mensaje que dice "Listening to port PORT . . .", siendo PORT=3000 o el definido como variable de entorno previamente, lo que indica que la API ya esta en ejecucion y a la espera de requests, las cuales se podran hacer por diversos medios.

### Ejecucion por Swagger

Para entrar al Swagger de la API, una vez que la misma este corriendo, en el navegador debe dirigirse a la direccion http://localhost:PORT/api/docs, teniendo en cuenta que PORT es el puerto local donde esta corriendo la API, y que en caso de ser distinto al default, este ya fue modificado en el swagger.json como se explico previamente.

En dicha direccion, se observaran los distintos endpoints disponibles junto con informacion relevante de los mismos (Que retornan, que parametros recibe y de que tipo, entre otros). A su vez, en la seccion inferior se pueden observar los distintos tipos de modelos a retornar (Player, Team, etc). Cada uno de estos endpoints puede ser ejecutado mediante la opcion "Try it out".

### Ejecucion por Postman

En caso de disponer la aplicacion de escritorio "Postman", dirigirse a :

File --> import --> Link , y en el cuadro de texto colocar el siguiente link :

https://www.getpostman.com/collections/35c49877e083f921b5ce

Al apretar "Continue", se le indicara que se quiere importar la coleccion "FInest Football Analyzer API" ( Lo cual es correcto), por ende para concluir la operacion de importacion de la misma debe apretar "import"

En caso de no disponer de la aplicacion de escritorio, se puede utilizar la extension que posee Google Chrome. En dicho caso, habiendose descargado previamente dicha extension, es suficiente con colocar el link anterior en dicho navegador

Una vez importada la coleccion, se observaran los distintos endpoints disponibles de la API, junto con sus diferentes parametros. En los caso de que el endpoint sea de la forma /api/xxxxx/{id}, debe reemplazarse el "{id}" por un numero positivo.

Tener en cuenta que todos los endpoint estan con el puerto default (3000), pero en caso de ejecutarse la API en un puerto distinto, este debe modificarse en los endpoint de la coleccion.

En caso de no recordar que devolvia cada endpoint o que significaba cada parametro,entre otras posibles dudas, consultar la documentacion de swagger mencionada en el item anterior (http://localhost:PORT/api/docs)