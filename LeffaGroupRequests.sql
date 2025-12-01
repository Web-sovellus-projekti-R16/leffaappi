DROP TABLE IF EXISTS account_group_request CASCADE;

CREATE TABLE account_group_request (
  request_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL,
  group_id INT NOT NULL,
  requested_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES "group"(group_id) ON DELETE CASCADE,
  UNIQUE(account_id, group_id)
);
