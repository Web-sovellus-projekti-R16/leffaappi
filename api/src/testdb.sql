DROP TABLE IF EXISTS account CASCADE;

CREATE TABLE account (
	account_id SERIAL PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	is_deleted BOOLEAN DEFAULT false,
	account_removed DATE
);
