DROP TABLE IF EXISTS player;
DROP TABLE IF EXISTS team;
DROP TABLE IF EXISTS national_team;

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

--Create tables used for queries
CREATE TABLE team(
      team_id INTEGER PRIMARY KEY,
      team_name TEXT,
      league TEXT,
      transfer_budget INTEGER,
      team_average_age FLOAT
);

CREATE TABLE national_team(
      national_team_id INTEGER PRIMARY KEY,
      national_team_name TEXT
);

CREATE TABLE player(
      player_id INTEGER PRIMARY KEY ,
      name TEXT,
      fullname TEXT,
      age INTEGER,
      height INTEGER,
      photo_url TEXT,
      nationality TEXT,
      total_score INTEGER,
      positions TEXT[],
      best_position TEXT,
      team_id INTEGER,
      value_eur INTEGER,
      release_clause INTEGER,
      contract_until INTEGER,
      national_team_id INTEGER,
      preferred_foot TEXT,
      pace_total INTEGER,
      shooting_total INTEGER,
      passing_total INTEGER,
      dribbling_total INTEGER,
      defending_total INTEGER,
      physicality_total INTEGER,
      FOREIGN KEY (team_id) references team(team_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (national_team_id) references national_team(national_team_id) ON DELETE CASCADE ON UPDATE CASCADE

);

-------------Import teams-------------

--Populate the table team with imported data with the use of the split function to remove the "(x)" in the League name--

INSERT INTO team
SELECT ID, Name, split_part(League, '(', 1),
TransferBudget, AllTeamAverageAge FROM tmp_team;

--Correct the incorrect league names

UPDATE team SET league= TRIM(league,chr(160));
UPDATE team SET league= RTRIM(league);

--Populate the national team table with imported data

INSERT INTO national_team
SELECT team_id, team_name
FROM team WHERE league= 'International';

--Remove the national teams from the teams table

DELETE FROM team WHERE league='International';


-------------Import players-------------

--Populate the table player with imported data

INSERT INTO player
SELECT DISTINCT (p.id), p.Name, p.FullName, p.Age, p.Height, p.PhotoUrl, p.Nationality, p.Overall,
STRING_TO_ARRAY(p.Positions,','), p.BestPosition, t.team_id AS CLUB, p.ValueEUR, p.ReleaseClause,
p.ContractUntil, n.national_team_id, p.PreferredFoot,p.PaceTotal, p.ShootingTotal, p.PassingTotal, p.DribblingTotal, p.DefendingTotal,
p.PhysicalityTotal FROM tmp_player p LEFT OUTER JOIN team t ON p.Club=t.team_name LEFT OUTER JOIN national_team n ON
P.NationalTeam = N.national_team_name;

-------------Import players history-------------

--Create temp table for player's history across all games imported

DROP TABLE IF EXISTS tmp_history_total;

CREATE TEMP TABLE tmp_history_total(
      id INTEGER,
      name TEXT,
      team TEXT,
      team_id INTEGER,
      nationality TEXT,
      year INTEGER
);

--Populate tmp_history_total with the imported data

INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2017 FROM tmp_history_17 p LEFT OUTER JOIN team t ON p.club= t.team_name;

INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2018 FROM tmp_history_18 p LEFT OUTER JOIN team t ON p.club= t.team_name;

INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2019 FROM tmp_history_19 p LEFT OUTER JOIN team t ON p.club= t.team_name;

INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2020 FROM tmp_history_20 p LEFT OUTER JOIN team t ON p.club= t.team_name;

INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2021 FROM tmp_history_21 p LEFT OUTER JOIN team t ON p.club= t.team_name;

INSERT INTO tmp_history_total
SELECT DISTINCT (p.player_id), p.name, t.team_name, t.team_id, p.nationality, 2022 FROM player p LEFT OUTER JOIN team t on p.team_id = t.team_id ;

--Remove spaces present in the name
UPDATE tmp_history_total SET name=trim(name);

--Remove players that are not in FIFA 22
DELETE FROM tmp_history_total WHERE id NOT IN (Select player_id from player) ;

--Create temp table used to correct repeated teams

DROP TABLE IF EXISTS tmp_history_repeated_club;
CREATE TEMP TABLE tmp_history_repeated_club(
      name_fifa_22 TEXT,
      name_previous_fifa TEXT,
      club_id INTEGER
);

--Population of temp table

INSERT INTO tmp_history_repeated_club
SELECT DISTINCT team.team_name,
tmp_history_total.team, tmp_history_total.team_id FROM team, tmp_history_total WHERE (position(team.team_name in tmp_history_total.team)>0 OR
position(tmp_history_total.team in team.team_name)>0 )AND length(team.team_name)<>length(tmp_history_total.team) AND tmp_history_total.team_id IS NULL
ORDER BY team_name;

--Remove particular teams manually (due to changing in names across games)

DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='Arsenal' AND name_previous_fifa='Arsenal Tula';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='Club Independiente Santa Fe' AND name_previous_fifa='Independiente';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='Everton' AND name_previous_fifa='CD Everton de Viña del Mar';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='FC Barcelona' AND name_previous_fifa='FC Barcelona B';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='Independiente del Valle' AND name_previous_fifa='Independiente';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='Inter' AND name_previous_fifa='Inter Miami';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='Liverpool' AND name_previous_fifa='Liverpool Fútbol Club';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='River Plate';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='SC Freiburg II' AND name_previous_fifa='SC Freiburg';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='SV Werder Bremen' AND name_previous_fifa='SV Werder Bremen II';
DELETE FROM tmp_history_repeated_club WHERE name_fifa_22='Universidad Católica' AND name_previous_fifa='Universidad Católica del Ecuador';

--Replace club names with the FIFA 22 names
UPDATE tmp_history_total
SET team = subquery.name_fifa_22
FROM (SELECT * from tmp_history_repeated_club) AS subquery
WHERE team = subquery.name_previous_fifa;

--Addition of the team's id to temp table
UPDATE tmp_history_total
SET team_id = subquery.team_id
FROM (SELECT * from team) AS subquery
WHERE team = subquery.team_name;

--Replace nationalities with the ones from FIFA 22
UPDATE tmp_history_total
SET nationality = subquery.nationality
FROM (SELECT * from player) AS subquery
WHERE id = subquery.player_id;

--Remove teams not present in FIFA 22
DELETE FROM tmp_history_total WHERE team IS NOT NULL AND team_id IS NULL;

--Create history table, used for import in Neo4J
DROP TABLE IF EXISTS history;

CREATE TABLE history(
      player_id INTEGER,
      player_name TEXT,
      team_name TEXT,
      team_id INTEGER,
      player_nationality TEXT,
      year INTEGER,
      PRIMARY KEY(player_id,year),
      FOREIGN KEY (player_id) references player(player_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (team_id) references team(team_id) ON DELETE CASCADE ON UPDATE CASCADE
);

--Delete players who played free agent until 2021 included
DELETE FROM tmp_history_total WHERE team IS NULL and Year<>2022;

--Delete players who play as free agents in 202 but don't have a national team
DELETE FROM tmp_history_total where id IN (SELECT p.player_id as id from player p where p.team_id is null and national_team_id is null);

--Update player names different from the ones in FIFA 22
UPDATE tmp_history_total
SET name = subquery.fullname
FROM (SELECT * FROM player) AS subquery
WHERE tmp_history_total.id = subquery.player_id;

--Populate history table
INSERT INTO history
SELECT id,name, team, team_id, nationality, year FROM tmp_history_total;

--Drop tables used for imports
DROP TABLE tmp_team;
DROP TABLE tmp_player;
DROP TABLE tmp_history_17;
DROP TABLE tmp_history_18;
DROP TABLE tmp_history_19;
DROP TABLE tmp_history_20;
DROP TABLE tmp_history_21;



