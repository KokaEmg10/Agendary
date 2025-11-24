-- create_db_and_tables.sql
CREATE DATABASE AgendaryDB;
GO
USE AgendaryDB;
GO

CREATE TABLE Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(100) NOT NULL UNIQUE,
  password_hash NVARCHAR(256) NOT NULL,
  created_at DATETIME DEFAULT GETDATE()
);
GO
