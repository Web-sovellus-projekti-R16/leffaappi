drop table if exists account cascade;
drop table if exists account_group cascade;
drop table if exists "group" cascade;
drop table if exists movie cascade;
drop table if exists account_movie cascade;

create table account (
	id serial primary key,
	email varchar(255) unique not null,
	password_hash varchar(255) not null,
	is_deleted boolean default false,
	account_removed date
);

create table "group" (
	id serial primary key,
	name varchar(255) not null,
	description text,
	owner_email varchar(255)
);

create table account_group (
	id serial primary key,
	account_id int not null,
	group_id int not null,
	foreign key (account_id) references account(id) on delete cascade,
	foreign key (group_id) references "group"(id) on delete cascade
);

create table movie (
	id serial primary key,
	tmdb_id int not null
);

create table account_movie (
	id serial primary key,
	account_id int not null,
	movie_id int not null,
	grade int,
	review text,
	foreign key (account_id) references account(id) on delete cascade,
	foreign key (movie_id) references movie(id) on delete cascade
);