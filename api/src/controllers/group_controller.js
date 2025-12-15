import {
  createGroup,
  getGroups,
  leaveGroup,
  requestToJoinGroup,
  approveJoinRequest,
  denyJoinRequest,
  getJoinRequestsByGroup,
  getGroupById,
  kickGroupMember,
  getGroupMembers,
  addMemberToGroup,
  addMovieToGroup,
  getMoviesByGroupId
} from "../models/group_model.js";

import { searchMovieByTmdbId } from "../helpers/tmdbService.js";


const validateGroupId = (groupId) => {
  const id = Number(groupId);
  if (isNaN(id) || id <= 0) return false;
  return id;
};

const requireAuth = (req, res) => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "Authentication required." });
    return false;
  }
  return true;
};


export const createGroupController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const { name, description, ownerEmail } = req.body;
    const ownerId = req.user.id;

    if (!name || !ownerEmail) {
      return res.status(400).json({ error: "Missing group name or owner email." });
    }

    const result = await createGroup(name, description, ownerEmail);
    const newGroup = result.rows[0];

    await addMemberToGroup(ownerId, newGroup.group_id);

    return res.status(201).json({ group: newGroup });
  } catch (err) {
    console.error("Group creation error:", err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Group already exists." });
    }
    return res.status(500).json({ error: "Failed to create group." });
  }
};

export const getGroupsController = async (req, res) => {
  try {
    const result = await getGroups();
    return res.json({ groups: result.rows });
  } catch (err) {
    console.error("Group fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch groups." });
  }
};

export const getGroupController = async (req, res) => {
  try {
    const groupId = validateGroupId(req.params.groupId);
    if (!groupId) {
      return res.status(400).json({ error: "Invalid Group ID format." });
    }

    const result = await getGroupById(groupId);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Group not found." });
    }

    return res.json({ group: result.rows[0] });
  } catch (err) {
    console.error("Group lookup error:", err);
    return res.status(500).json({ error: "Failed to fetch group." });
  }
};

export const requestToJoinGroupController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const { groupId } = req.body;
    const validatedGroupId = validateGroupId(groupId);
    if (!validatedGroupId) {
      return res.status(400).json({ error: "Invalid Group ID format." });
    }

    const result = await requestToJoinGroup(req.user.id, validatedGroupId);
    return res.status(201).json({ request: result.rows[0] });
  } catch (err) {
    console.error("Join request error:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Join request already exists." });
    }
    return res.status(500).json({ error: "Failed to send join request." });
  }
};

export const approveJoinRequestController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const { requestId } = req.body;
    const validatedRequestId = validateGroupId(requestId);
    if (!validatedRequestId) {
      return res.status(400).json({ error: "Invalid Request ID format." });
    }

    const approved = await approveJoinRequest(validatedRequestId);
    return res.status(201).json({ approved });
  } catch (err) {
    console.error("Approve request error:", err);
    return res.status(500).json({ error: "Failed to approve request." });
  }
};

export const denyJoinRequestController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const { requestId } = req.body;
    const validatedRequestId = validateGroupId(requestId);
    if (!validatedRequestId) {
      return res.status(400).json({ error: "Invalid Request ID format." });
    }

    const denied = await denyJoinRequest(validatedRequestId);
    return res.json({ denied });
  } catch (err) {
    console.error("Deny request error:", err);
    return res.status(500).json({ error: "Failed to deny request." });
  }
};

export const leaveGroupController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const { groupId } = req.body;
    const validatedGroupId = validateGroupId(groupId);
    if (!validatedGroupId) {
      return res.status(400).json({ error: "Invalid Group ID format." });
    }

    await leaveGroup(req.user.id, validatedGroupId);
    return res.json({ message: "Left group." });
  } catch (err) {
    console.error("Leave group error:", err);
    return res.status(500).json({ error: "Failed to leave group." });
  }
};

export const getJoinRequestsByGroupController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const groupId = validateGroupId(req.params.groupId);
    if (!groupId) {
      return res.status(400).json({ error: "Invalid Group ID format." });
    }

    const result = await getJoinRequestsByGroup(groupId);
    return res.json({ requests: result.rows });
  } catch (err) {
    console.error("Join requests lookup error:", err);
    return res.status(500).json({ error: "Failed to fetch join requests." });
  }
};

export const getGroupMembersController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const groupId = validateGroupId(req.params.groupId);
    if (!groupId) {
      return res.status(400).json({ error: "Invalid Group ID format." });
    }

    const result = await getGroupMembers(groupId);
    return res.json({ members: result.rows });
  } catch (err) {
    console.error("Group members fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch group members." });
  }
};

export const kickGroupMemberController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const { groupId, memberId } = req.body;
    const currentUserEmail = req.user.email;

    if (!groupId || !memberId) {
      return res.status(400).json({ error: "Group ID and Member ID are required." });
    }

    const validatedGroupId = validateGroupId(groupId);
    const validatedMemberId = validateGroupId(memberId);

    if (!validatedGroupId || !validatedMemberId) {
      return res.status(400).json({ error: "Invalid Group ID or Member ID format." });
    }

    const groupResult = await getGroupById(validatedGroupId);
    if (groupResult.rowCount === 0) {
      return res.status(404).json({ error: "Group not found." });
    }

    const group = groupResult.rows[0];

    if (group.owner_email.toLowerCase() !== currentUserEmail.toLowerCase()) {
      return res.status(403).json({ error: "Forbidden. Only the group owner can kick members." });
    }

    if (validatedMemberId === req.user.id) {
      return res.status(400).json({ error: "Cannot kick self. Use the 'Leave Group' button instead." });
    }

    await kickGroupMember(validatedGroupId, validatedMemberId);
    return res.json({ message: "Member kicked successfully." });
  } catch (err) {
    console.error("Kick member error:", err);
    if (err.message === "Member not found in group.") {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to kick member." });
  }
};

export const handleAddMovieToGroupController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const { groupId, movieId } = req.body;
    const accountId = req.user.id;

    if (!groupId || !movieId) {
      return res.status(400).json({ error: "Group ID and Movie ID are required." });
    }

    const validatedGroupId = validateGroupId(groupId);
    const validatedMovieId = Number(movieId);

    if (!validatedGroupId || isNaN(validatedMovieId) || validatedMovieId <= 0) {
      return res.status(400).json({ error: "Invalid Group ID or Movie ID format." });
    }

    const membersResult = await getGroupMembers(validatedGroupId);
    const isMember = membersResult.rows.some(m => m.account_id === accountId);

    if (!isMember) {
      return res.status(403).json({ error: "Forbidden. Only group members can add movies." });
    }

    const result = await addMovieToGroup(validatedGroupId, validatedMovieId);

    if (result.rowCount === 0) {
      return res.status(409).json({ error: "Movie is already in this group." });
    }

    return res.status(201).json({ message: "Movie added to group successfully." });
  } catch (err) {
    console.error("Add movie to group error:", err);
    return res.status(500).json({ error: "Failed to add movie to group." });
  }
};

export const handleGetGroupMoviesController = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    const validatedGroupId = validateGroupId(req.params.groupId);
    const accountId = req.user.id;

    if (!validatedGroupId) {
      return res.status(400).json({ error: "Invalid Group ID provided." });
    }

    const membersResult = await getGroupMembers(validatedGroupId);
    const isMember = membersResult.rows.some(m => m.account_id === accountId);

    if (!isMember) {
      return res.status(403).json({ error: "Forbidden. You must be a member to view the movie list." });
    }

    const dbResult = await getMoviesByGroupId(validatedGroupId);

    const movieDetailsPromises = dbResult.rows.map(async (movieEntry) => {
      const details = await searchMovieByTmdbId(movieEntry.movie_id);
      if (!details) return null;

      return {
        tmdb_id: details.id,
        title: details.title,
        release_date: details.release_date,
        poster_path: details.poster_path
          ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
          : null,
        added_at: movieEntry.added_at
      };
    });

    const moviesWithDetails = (await Promise.all(movieDetailsPromises)).filter(Boolean);
    return res.status(200).json({ movies: moviesWithDetails });
  } catch (err) {
    console.error("Get group movies error:", err);
    return res.status(500).json({ error: "Failed to fetch movie list." });
  }
};
