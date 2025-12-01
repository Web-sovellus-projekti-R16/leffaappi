drop table if exists account_group_request cascade;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS account_group CASCADE;
DROP TABLE IF EXISTS "group" CASCADE;
DROP TABLE IF EXISTS movie CASCADE;
DROP TABLE IF EXISTS review CASCADE;

CREATE TABLE account (
	account_id SERIAL PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	is_deleted BOOLEAN DEFAULT false,
	account_removed DATE
);

CREATE TABLE "group" (
	group_id SERIAL PRIMARY KEY,
	"name" VARCHAR(255) NOT NULL,
	"description" TEXT,
	owner_email VARCHAR(255)
);

CREATE TABLE account_group (
	account_group_id SERIAL PRIMARY KEY,
	account_id INT NOT NULL,
	group_id INT NOT NULL,
	FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
	FOREIGN KEY (group_id) REFERENCES "group"(group_id) ON DELETE CASCADE
);

CREATE TABLE movie (
	movie_id SERIAL PRIMARY KEY,
	tmdb_id INT NOT NULL
);

CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL, 
    movie_id INTEGER NOT NULL, 
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
	created_at TIMESTAMP DEFAULT NOW(),
	FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
	FOREIGN KEY (movie_id) REFERENCES movie(movie_id) ON DELETE CASCADE
);

create table account_group_request (
    request_id serial primary key,
    account_id int not null,
    group_id int not null,
    requested_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES "group"(group_id) ON DELETE CASCADE,
    unique (account_id, group_id)
);
