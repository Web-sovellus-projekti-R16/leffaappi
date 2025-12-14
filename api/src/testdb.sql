DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS movie CASCADE;
DROP TABLE IF EXISTS review CASCADE;

CREATE TABLE account (
	account_id SERIAL PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	is_deleted BOOLEAN DEFAULT false,
	account_removed DATE
);

CREATE TABLE movie (
	movie_id SERIAL PRIMARY KEY,
	tmdb_id INT NOT NULL
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

TRUNCATE TABLE account RESTART IDENTITY CASCADE;