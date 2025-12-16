DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS account_group CASCADE;
DROP TABLE IF EXISTS account_group_request CASCADE;
DROP TABLE IF EXISTS "group" CASCADE;
DROP TABLE IF EXISTS movie CASCADE;
DROP TABLE IF EXISTS group_movie CASCADE;
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
	UNIQUE (account_id, group_id)
);

CREATE TABLE account_group_request (
    request_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES "group"(group_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, account_id)
);

CREATE TABLE movie (
	movie_id SERIAL PRIMARY KEY,
	tmdb_id INT NOT NULL
);

CREATE TABLE group_movie (
    group_id INTEGER NOT NULL REFERENCES "group"(group_id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL, 
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, movie_id) 
);

CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL, 
    movie_id INTEGER NOT NULL, 
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
	favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movie(movie_id) ON DELETE CASCADE
);

