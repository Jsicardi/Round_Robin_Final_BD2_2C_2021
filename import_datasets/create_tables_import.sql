--Tables for csv import

--import of file teams_fifa22.csv
CREATE TABLE tmp_team(
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

--import of file players_fifa22.csv
CREATE TABLE tmp_player(
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

--import of file FIFA17_official_data.csv
CREATE TABLE tmp_history_17(
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

--import of file FIFA18_official_data.csv
CREATE TABLE tmp_history_18(
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

--import of file FIFA19_official_data.csv
CREATE TABLE tmp_history_19(
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

--import of file FIFA20_official_data.csv
CREATE TABLE tmp_history_20(
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

--import of file FIFA21_official_data.csv
CREATE TABLE tmp_history_21(
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

