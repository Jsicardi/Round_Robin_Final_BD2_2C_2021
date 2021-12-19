CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

DROP TABLE IF EXISTS tmp_team;
DROP TABLE IF EXISTS player;
DROP TABLE IF EXISTS team;
DROP TABLE IF EXISTS national_team;
DROP TABLE IF EXISTS tmp_player;
                                        --Import Teams--

--First, we create a temporary table to import all the columns of the csv

CREATE TEMP TABLE tmp_team(
      ID INTEGER PRIMARY KEY,
      Name TEXT,
      League TEXT,
      LeagueId INTEGER,
      Overall INTEGER,
      Attack INTEGER,
      Midfield INTEGER,
      Defence INTEGER,
      TransferBudget INTEGER,
      DomesticPrestige INTEGER,
      IntPrestige INTEGER,
      Players INTEGER,
      StartingAverageAge FLOAT,
      AllTeamAverageAge FLOAT
);

--Then, we import the csv with "COPY FROM"--

COPY tmp_team FROM '/import_datasets/teams_fifa22.csv' DELIMITER ',' CSV HEADER;

--Then, we create the table of teams with the relevant fields and with the names that we choose--

CREATE TABLE team(
      team_id INTEGER PRIMARY KEY,
      team_name TEXT,
      league TEXT,
--       attack_percentage INTEGER,
--       midfield_percentage INTEGER,
--       defence_percentage INTEGER,
      transfer_budget INTEGER,
      team_average_age FLOAT
);

--Then, we insert the respective columns in the table. We use the split function to remove the "(x)" in the League name--

INSERT INTO team
SELECT ID, Name, split_part(League, '(', 1),
TransferBudget, AllTeamAverageAge FROM tmp_team;

--Correct certain team's league name

UPDATE team SET league= TRIM(league,chr(160));
UPDATE team SET league= RTRIM(league);

--We create an independent table for national teams--

CREATE TABLE national_team(
      national_team_id INTEGER PRIMARY KEY,
      national_team_name TEXT
--       Attack_percentage INTEGER,
--       midfield_percentage INTEGER,
--       defence_percentage INTEGER
);

--We copy the national teams to that table ( The ones with league='International')

INSERT INTO national_team
SELECT team_id, team_name --, AttackPercentage ,MidfieldPercentage ,DefencePercentage
FROM team WHERE league= 'International';

--Then, we remove that teams from the teams table--

DELETE FROM team WHERE league='International';


                                        --Import players--

--First, we create a temporary table to import all the columns of the csv

CREATE TEMP TABLE tmp_player(
      ID INTEGER,
      Name TEXT,
      FullName TEXT,
      Age INTEGER,
      Height INTEGER, --In cm
      Weight INTEGER, --In kg
      PhotoUrl TEXT,
      Nationality TEXT,
      Overall INTEGER,
      Potential INTEGER,
      Growth INTEGER,
      TotalStats INTEGER,
      BaseStats INTEGER,
      Positions TEXT,
      BestPosition TEXT, --It could be varchar, but I left it that way by now
      Club TEXT,
      ValueEUR INTEGER,
      WageEUR INTEGER,
      ReleaseClause INTEGER,
      ClubPosition TEXT,
      ContractUntil INTEGER,
      ClubNumber INTEGER,
      ClubJoined INTEGER,
      OnLoad BOOLEAN,
      NationalTeam TEXT,
      NationalPosition TEXT,
      NationalNumber TEXT,
      PreferredFoot TEXT,
      IntReputation INTEGER,
      WeakFoot INTEGER,
      SkillMoves INTEGER,
      AttackingWorkRate TEXT, --Low, Medium, High
      DefensiveWorkRate TEXT, --Low, Medium, High
      PaceTotal INTEGER,
      ShootingTotal INTEGER,
      PassingTotal INTEGER,
      DribblingTotal INTEGER,
      DefendingTotal INTEGER,
      PhysicalityTotal INTEGER,
      Crossing INTEGER,
      Finishing INTEGER,
      HeadingAccuracy INTEGER,
      ShortPassing INTEGER,
      Volleys INTEGER,
      Dribbling INTEGER,
      Curve INTEGER,
      FKAccuracy INTEGER,
      LongPassing INTEGER,
      BallControl INTEGER,
      Acceleration INTEGER,
      SprintSpeed INTEGER,
      Agility INTEGER,
      Reactions INTEGER,
      Balance INTEGER,
      ShotPower INTEGER,
      Jumping INTEGER,
      Stamina INTEGER,
      Strength INTEGER,
      LongShots INTEGER,
      Aggression INTEGER,
      Interceptions INTEGER,
      Positioning INTEGER,
      Vision INTEGER,
      Penalties INTEGER,
      Composure INTEGER,
      Marking INTEGER,
      StandingTackle INTEGER,
      SlidingTackle INTEGER,
      GKDiving INTEGER,
      GKHandling INTEGER,
      GKKicking INTEGER,
      GKPositioning INTEGER,
      GKReflexes INTEGER,
      STRating INTEGER,
      LWRating INTEGER,
      LFRating INTEGER,
      CFRating INTEGER,
      RFRating INTEGER,
      RWRating INTEGER,
      CAMRating INTEGER,
      LMRating INTEGER,
      CMRating INTEGER,
      RMRating INTEGER,
      LWBRating INTEGER,
      CDMRating INTEGER,
      RWBRating INTEGER,
      LBRating	INTEGER,
      CBRating	INTEGER,
      RBRating	INTEGER,
      GKRating INTEGER
);

--Then, we import the csv with "COPY FROM"--

COPY tmp_player FROM '/import_datasets/players_fifa22.csv' DELIMITER ',' CSV HEADER;

--Then, we create the table of players with the relevant fields and with the names that we choose--

DROP TABLE IF EXISTS player;

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

--Then, we insert the respective columns in the table.

INSERT INTO player
SELECT DISTINCT (p.id), p.Name, p.FullName, p.Age, p.Height, p.PhotoUrl, p.Nationality, p.Overall,
STRING_TO_ARRAY(p.Positions,','), p.BestPosition, t.team_id AS CLUB, p.ValueEUR, p.ReleaseClause,
p.ContractUntil, n.national_team_id, p.PreferredFoot,p.PaceTotal, p.ShootingTotal, p.PassingTotal, p.DribblingTotal, p.DefendingTotal,
p.PhysicalityTotal FROM tmp_player p LEFT OUTER JOIN team t ON p.Club=t.team_name LEFT OUTER JOIN national_team n ON
P.NationalTeam = N.national_team_name;

                                        --Import players history--

--First, we create a temporary table per FIFA year to import all the columns of the csv

DROP TABLE IF EXISTS tmp_history_17;
DROP TABLE IF EXISTS tmp_history_18;
DROP TABLE IF EXISTS tmp_history_19;
DROP TABLE IF EXISTS tmp_history_20;
DROP TABLE IF EXISTS tmp_history_21;

CREATE TEMP TABLE tmp_history_17(
      ID INTEGER,
      Name TEXT,
      FullName TEXT,
      Photo TEXT,
      Nationality TEXT,
      Flag TEXT,
      Overall INTEGER,
      Potential INTEGER,
      Club TEXT,
      ClubLogo TEXT,
      Value TEXT,
      Wage TEXT,
      Special INTEGER,
      PreferredFoot TEXT,
      InternationalReputation FLOAT,
      WeakFoot FLOAT,
      SkillMoves FLOAT,
      WorkRate TEXT,
      BodyType TEXT,
      RealFace TEXT,
      Position TEXT,
      JerseyNumber FLOAT,
      Joined TEXT,
      LoanedFrom TEXT,
      ContractValidUntil TEXT,
      Height TEXT,
      Weight TEXT,
      Crossing FLOAT,
      Finishing FLOAT,
      HeadingAccuracy FLOAT,
      ShortPassing FLOAT,
      Volleys FLOAT,
      Dribbling FLOAT,
      Curve FLOAT,
      FKAccuracy FLOAT,
      LongPassing FLOAT,
      BallControl FLOAT,
      Acceleration FLOAT,
      SprintSpeed FLOAT,
      Agility FLOAT,
      Reactions FLOAT,
      Balance FLOAT,
      ShotPower FLOAT,
      Jumping FLOAT,
      Stamina FLOAT,
      Strength FLOAT,
      LongShots FLOAT,
      Aggression FLOAT,
      Interceptions FLOAT,
      Positioning FLOAT,
      Vision FLOAT,
      Penalties FLOAT,
      Composure FLOAT,
      Marking FLOAT,
      StandingTackle FLOAT,
      SlidingTackle FLOAT,
      GKDiving FLOAT,
      GKHandling FLOAT,
      GKKicking FLOAT,
      GKPositioning FLOAT,
      GKReflexes FLOAT,
      BestPosition TEXT,
      BestOverallRating FLOAT

);

CREATE TEMP TABLE tmp_history_18(
  ID INTEGER,
      Name TEXT,
      FullName TEXT,
      Photo TEXT,
      Nationality TEXT,
      Flag TEXT,
      Overall INTEGER,
      Potential INTEGER,
      Club TEXT,
      ClubLogo TEXT,
      Value TEXT,
      Wage TEXT,
      Special INTEGER,
      PreferredFoot TEXT,
      InternationalReputation FLOAT,
      WeakFoot FLOAT,
      SkillMoves FLOAT,
      WorkRate TEXT,
      BodyType TEXT,
      RealFace TEXT,
      Position TEXT,
      JerseyNumber FLOAT,
      Joined TEXT,
      LoanedFrom TEXT,
      ContractValidUntil TEXT,
      Height TEXT,
      Weight TEXT,
      Crossing FLOAT,
      Finishing FLOAT,
      HeadingAccuracy FLOAT,
      ShortPassing FLOAT,
      Volleys FLOAT,
      Dribbling FLOAT,
      Curve FLOAT,
      FKAccuracy FLOAT,
      LongPassing FLOAT,
      BallControl FLOAT,
      Acceleration FLOAT,
      SprintSpeed FLOAT,
      Agility FLOAT,
      Reactions FLOAT,
      Balance FLOAT,
      ShotPower FLOAT,
      Jumping FLOAT,
      Stamina FLOAT,
      Strength FLOAT,
      LongShots FLOAT,
      Aggression FLOAT,
      Interceptions FLOAT,
      Positioning FLOAT,
      Vision FLOAT,
      Penalties FLOAT,
      Composure FLOAT,
      Marking FLOAT,
      StandingTackle FLOAT,
      SlidingTackle FLOAT,
      GKDiving FLOAT,
      GKHandling FLOAT,
      GKKicking FLOAT,
      GKPositioning FLOAT,
      GKReflexes FLOAT,
      BestPosition TEXT,
      BestOverallRating FLOAT,
      ReleaseClause TEXT

);

CREATE TEMP TABLE tmp_history_19(
  ID INTEGER,
      Name TEXT,
      FullName TEXT,
      Photo TEXT,
      Nationality TEXT,
      Flag TEXT,
      Overall INTEGER,
      Potential INTEGER,
      Club TEXT,
      ClubLogo TEXT,
      Value TEXT,
      Wage TEXT,
      Special INTEGER,
      PreferredFoot TEXT,
      InternationalReputation FLOAT,
      WeakFoot FLOAT,
      SkillMoves FLOAT,
      WorkRate TEXT,
      BodyType TEXT,
      RealFace TEXT,
      Position TEXT,
      JerseyNumber FLOAT,
      Joined TEXT,
      LoanedFrom TEXT,
      ContractValidUntil TEXT,
      Height TEXT,
      Weight TEXT,
      Crossing FLOAT,
      Finishing FLOAT,
      HeadingAccuracy FLOAT,
      ShortPassing FLOAT,
      Volleys FLOAT,
      Dribbling FLOAT,
      Curve FLOAT,
      FKAccuracy FLOAT,
      LongPassing FLOAT,
      BallControl FLOAT,
      Acceleration FLOAT,
      SprintSpeed FLOAT,
      Agility FLOAT,
      Reactions FLOAT,
      Balance FLOAT,
      ShotPower FLOAT,
      Jumping FLOAT,
      Stamina FLOAT,
      Strength FLOAT,
      LongShots FLOAT,
      Aggression FLOAT,
      Interceptions FLOAT,
      Positioning FLOAT,
      Vision FLOAT,
      Penalties FLOAT,
      Composure FLOAT,
      Marking FLOAT,
      StandingTackle FLOAT,
      SlidingTackle FLOAT,
      GKDiving FLOAT,
      GKHandling FLOAT,
      GKKicking FLOAT,
      GKPositioning FLOAT,
      GKReflexes FLOAT,
      BestPosition TEXT,
      BestOverallRating FLOAT,
      ReleaseClause TEXT

);

CREATE TEMP TABLE tmp_history_20(
 ID INTEGER,
      Name TEXT,
      FullName TEXT,
      Photo TEXT,
      Nationality TEXT,
      Flag TEXT,
      Overall INTEGER,
      Potential INTEGER,
      Club TEXT,
      ClubLogo TEXT,
      Value TEXT,
      Wage TEXT,
      Special INTEGER,
      PreferredFoot TEXT,
      InternationalReputation FLOAT,
      WeakFoot FLOAT,
      SkillMoves FLOAT,
      WorkRate TEXT,
      BodyType TEXT,
      RealFace TEXT,
      Position TEXT,
      JerseyNumber FLOAT,
      Joined TEXT,
      LoanedFrom TEXT,
      ContractValidUntil TEXT,
      Height TEXT,
      Weight TEXT,
      Crossing FLOAT,
      Finishing FLOAT,
      HeadingAccuracy FLOAT,
      ShortPassing FLOAT,
      Volleys FLOAT,
      Dribbling FLOAT,
      Curve FLOAT,
      FKAccuracy FLOAT,
      LongPassing FLOAT,
      BallControl FLOAT,
      Acceleration FLOAT,
      SprintSpeed FLOAT,
      Agility FLOAT,
      Reactions FLOAT,
      Balance FLOAT,
      ShotPower FLOAT,
      Jumping FLOAT,
      Stamina FLOAT,
      Strength FLOAT,
      LongShots FLOAT,
      Aggression FLOAT,
      Interceptions FLOAT,
      Positioning FLOAT,
      Vision FLOAT,
      Penalties FLOAT,
      Composure FLOAT,
      Marking FLOAT,
      StandingTackle FLOAT,
      SlidingTackle FLOAT,
      GKDiving FLOAT,
      GKHandling FLOAT,
      GKKicking FLOAT,
      GKPositioning FLOAT,
      GKReflexes FLOAT,
      BestPosition TEXT,
      BestOverallRating FLOAT,
      ReleaseClause TEXT,
      DefensiveAwareness FLOAT

);

CREATE TEMP TABLE tmp_history_21(
      ID INTEGER,
      Name TEXT,
      FullName TEXT,
      Photo TEXT,
      Nationality TEXT,
      Flag TEXT,
      Overall INTEGER,
      Potential INTEGER,
      Club TEXT,
      ClubLogo TEXT,
      Value TEXT,
      Wage TEXT,
      Special INTEGER,
      PreferredFoot TEXT,
      InternationalReputation FLOAT,
      WeakFoot FLOAT,
      SkillMoves FLOAT,
      WorkRate TEXT,
      BodyType TEXT,
      RealFace TEXT,
      Position TEXT,
      JerseyNumber FLOAT,
      Joined TEXT,
      LoanedFrom TEXT,
      ContractValidUntil TEXT,
      Height TEXT,
      Weight TEXT,
      Crossing FLOAT,
      Finishing FLOAT,
      HeadingAccuracy FLOAT,
      ShortPassing FLOAT,
      Volleys FLOAT,
      Dribbling FLOAT,
      Curve FLOAT,
      FKAccuracy FLOAT,
      LongPassing FLOAT,
      BallControl FLOAT,
      Acceleration FLOAT,
      SprintSpeed FLOAT,
      Agility FLOAT,
      Reactions FLOAT,
      Balance FLOAT,
      ShotPower FLOAT,
      Jumping FLOAT,
      Stamina FLOAT,
      Strength FLOAT,
      LongShots FLOAT,
      Aggression FLOAT,
      Interceptions FLOAT,
      Positioning FLOAT,
      Vision FLOAT,
      Penalties FLOAT,
      Composure FLOAT,
      Marking FLOAT,
      StandingTackle FLOAT,
      SlidingTackle FLOAT,
      GKDiving FLOAT,
      GKHandling FLOAT,
      GKKicking FLOAT,
      GKPositioning FLOAT,
      GKReflexes FLOAT,
      BestPosition TEXT,
      BestOverallRating FLOAT,
      ReleaseClause TEXT,
      DefensiveAwareness FLOAT

);

--Then, we import the csv's with "COPY FROM"--
COPY tmp_history_17 FROM '/import_datasets/FIFA17_official_data.csv' DELIMITER ',' CSV HEADER;
COPY tmp_history_18 FROM '/import_datasets/FIFA18_official_data.csv' DELIMITER ',' CSV HEADER;
COPY tmp_history_19 FROM '/import_datasets/FIFA19_official_data.csv' DELIMITER ',' CSV HEADER;
COPY tmp_history_20 FROM '/import_datasets/FIFA20_official_data.csv' DELIMITER ',' CSV HEADER;
COPY tmp_history_21 FROM '/import_datasets/FIFA21_official_data.csv' DELIMITER ',' CSV HEADER;

--Then, we create a temporary table for all histories

DROP TABLE IF EXISTS tmp_history_total;

CREATE TEMP TABLE tmp_history_total(
      id INTEGER,
      name TEXT,
      team TEXT,
      team_id INTEGER,
      nationality TEXT,
      year INTEGER
);

--We insert the rows with the players and their teams per year

--2017--
INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2017 FROM tmp_history_17 p LEFT OUTER JOIN team t ON p.club= t.team_name;

--2018--
INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2018 FROM tmp_history_18 p LEFT OUTER JOIN team t ON p.club= t.team_name;

--2019--
INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2019 FROM tmp_history_19 p LEFT OUTER JOIN team t ON p.club= t.team_name;

--2020--
INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2020 FROM tmp_history_20 p LEFT OUTER JOIN team t ON p.club= t.team_name;

--2021--
INSERT INTO tmp_history_total
SELECT DISTINCT (p.id), p.name, p.club, t.team_id, p.nationality, 2021 FROM tmp_history_21 p LEFT OUTER JOIN team t ON p.club= t.team_name;

--2022--
INSERT INTO tmp_history_total
SELECT DISTINCT (p.player_id), p.name, t.team_name, t.team_id, p.nationality, 2022 FROM player p LEFT OUTER JOIN team t on p.team_id = t.team_id ;

--Remove the spaces in back and front from the name
UPDATE tmp_history_total SET name=trim(name);

--Remove the players that are not in FIFA 22
DELETE FROM tmp_history_total WHERE id NOT IN (Select player_id from player) ;

--Then we insert that teams on a temporary table to make changes on it

DROP TABLE IF EXISTS tmp_history_repeated_club;
CREATE TEMP TABLE tmp_history_repeated_club(
      name_fifa_22 TEXT,
      name_previous_fifa TEXT,
      club_id INTEGER
);


INSERT INTO tmp_history_repeated_club
SELECT DISTINCT team.team_name,
tmp_history_total.team, tmp_history_total.team_id FROM team, tmp_history_total WHERE (position(team.team_name in tmp_history_total.team)>0 OR
position(tmp_history_total.team in team.team_name)>0 )AND length(team.team_name)<>length(tmp_history_total.team) AND tmp_history_total.team_id IS NULL
ORDER BY team_name;

--Then, we remove some teams manually

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

--Then, we replace the club names with the ones in fifa 22

UPDATE tmp_history_total
SET team = subquery.name_fifa_22
FROM (SELECT * from tmp_history_repeated_club) AS subquery
WHERE team = subquery.name_previous_fifa;

--Then, we put the ids of the clubs

UPDATE tmp_history_total
SET team_id = subquery.team_id
FROM (SELECT * from team) AS subquery
WHERE team = subquery.team_name;

--Then, we delete the teams that are not in fifa 22 ( The ones with Club name different than null
--and clubId null )

DELETE FROM tmp_history_total WHERE team IS NOT NULL AND team_id IS NULL;

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

--We delete the players in tmpHistoryTotal that played "free agent" (club = NULL) until 2021 inclusive


DELETE FROM tmp_history_total WHERE team IS NULL and Year<>2022;

--We delete the players in tmpHistoryTotal that plays "free agent" (club = NULL) in  2022, but does not play in national team
DELETE FROM tmp_history_total where id IN (SELECT p.player_id as id from player p where p.team_id is null and national_team_id is null);

--We updates some names so they can be equals with the ones in fifa 22 --->We use fullnames
--
UPDATE tmp_history_total
SET name = subquery.fullname
FROM (SELECT * FROM player) AS subquery
WHERE tmp_history_total.id = subquery.player_id;

--We insert in history all the fields in tmpHistoryTotal except clubId

INSERT INTO history
SELECT id,name, team, team_id, nationality, year FROM tmp_history_total;

COPY history TO '/import_datasets/players_history.csv' DELIMITER ',' CSV HEADER;

COPY (SELECT p.player_id as player_id, p.fullname as player_name, n.national_team_id as national_team_id, n.national_team_name as national_team_name, 2022 as year, p.nationality as player_nationality
FROM national_team N JOIN player p ON p.national_team_id = n.national_team_id) TO '/import_datasets/players_national_teams_history.csv'
DELIMITER ',' CSV HEADER;

DROP TABLE history;