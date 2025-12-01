import { pool } from "../helpers/db.js";

export const getGroupMembers = async (groupId) => {
  const query = `
    SELECT a.email AS member_email
    FROM account a
    JOIN account_group ag ON ag.account_id = a.account_id
    WHERE ag.group_id = $1
    ORDER BY a.email;
  `;
  return await pool.query(query, [groupId]);
};
