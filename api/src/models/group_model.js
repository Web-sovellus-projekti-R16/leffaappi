import { pool } from "../helpers/db.js";

export const createGroup = async (name, description, ownerEmail) => {
  const query = `INSERT INTO "group" (name, description, owner_email) VALUES ($1, $2, $3) RETURNING *;`;
  return await pool.query(query, [name, description, ownerEmail]);
};

export const addMemberToGroup = async (accountId, groupId) => {
  const query = `INSERT INTO account_group (account_id, group_id) VALUES ($1, $2) RETURNING *;`; 
  return await pool.query(query, [accountId, groupId]);
};
export const getGroups = async () => {
  return await pool.query(`SELECT * FROM "group" ORDER BY group_id;`); 
};


export const getGroupMembers = async (groupId) => {
  const query = `
    SELECT a.account_id, a.email AS member_email
    FROM account_group ag
    JOIN account a ON ag.account_id = a.account_id -- FIX 2: Changed 'a.id' to 'a.account_id'
    WHERE ag.group_id = $1;
  `;
  return await pool.query(query, [groupId]);
};

export const requestToJoinGroup = async (accountId, groupId) => {
  const query = `INSERT INTO account_group_request (account_id, group_id) VALUES ($1, $2) RETURNING *;`;
  return await pool.query(query, [accountId, groupId]);
};

export const approveJoinRequest = async (requestId) => {
  const result = await pool.query(
    `SELECT * FROM account_group_request WHERE request_id = $1;`,
    [requestId]
  );

  if (result.rowCount === 0) throw new Error("No join request found.");

  const { account_id, group_id } = result.rows[0];

  const memberInsert = await addMemberToGroup(account_id, group_id);

  await pool.query(
    `DELETE FROM account_group_request WHERE request_id = $1;`,
    [requestId]
  );

  return memberInsert;
};

export const denyJoinRequest = async (requestId) => {
  const result = await pool.query(
    `DELETE FROM account_group_request WHERE request_id = $1 RETURNING *;`,
    [requestId]
  );

  if (result.rowCount === 0) throw new Error("No join request found to deny.");

  return result;
};


export const leaveGroup = async (accountId, groupId) => {
  const query = `DELETE FROM account_group WHERE account_id = $1 AND group_id = $2 RETURNING *;`;
  const result = await pool.query(query, [accountId, groupId]);
  if (result.rowCount === 0) throw new Error("Not a member.");
  return result.rows[0];
};

export const kickGroupMember = async (groupId, accountId) => {
  const query = `
    DELETE FROM account_group 
    WHERE group_id = $1 AND account_id = $2 
    RETURNING *;
  `;
  const result = await pool.query(query, [groupId, accountId]);
  
  if (result.rowCount === 0) throw new Error("Member not found in group.");
  
  return result;
};

export const getGroupById = async (groupId) => {
  return await pool.query(`SELECT * FROM "group" WHERE group_id = $1;`, [groupId]);
};

export const getJoinRequestsByGroup = async (groupId) => {
  const query = `
    SELECT agr.request_id, a.account_id, a.email AS requester_email
    FROM account_group_request agr
    JOIN account a ON agr.account_id = a.account_id -- FIX 4: Changed 'a.id' to 'a.account_id'
    WHERE agr.group_id = $1;
  `;
  return await pool.query(query, [groupId]);
};

