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
  addMemberToGroup 
} from "../models/group_model.js";


const validateGroupId = (groupId) => {
    const id = Number(groupId);
    if (isNaN(id) || id <= 0) {
        return false;
    }
    return id;
}

export const createGroupController = async (req, res) => {
  try {
    const { name, description, ownerEmail } = req.body;
    const ownerId = req.user.id; 

    if (!ownerId) {
        console.error("Authentication Error: req.user.account_id is missing or null.");
        return res.status(401).json({ error: "Authentication required. Please log in again." });
    }
    
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
      return res.status(400).json({ error: "Join request already exists." });
    }
    return res.status(500).json({ error: "Failed to send join request." });
  }
};

export const approveJoinRequestController = async (req, res) => {
  try {
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

export const joinGroupController = async (req, res) => {
    return res.status(501).json({ error: "Direct join is not implemented. Use 'request to join'." });
};

export const leaveGroupController = async (req, res) => {
  try {
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