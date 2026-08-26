CREATE TABLE leitura (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataleitura TEXT NOT NULL,
  valorleitura REAL NOT NULL,
  fotoleitura TEXT
);

CREATE TABLE leiturasanepar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datasanepar TEXT NOT NULL,
  valorsanepar REAL NOT NULL
);
