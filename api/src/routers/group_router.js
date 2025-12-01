import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createGroupController,
  getGroupsController,
  getGroupController,
  joinGroupController,
  leaveGroupController,
  requestToJoinGroupController,
  approveJoinRequestController,
  denyJoinRequestController,
  getJoinRequestsByGroupController,
  getGroupMembersController,
  kickGroupMemberController
} from "../controllers/group_controller.js";

const router = express.Router();

router.get("/all", authMiddleware, getGroupsController);
router.get("/:groupId", authMiddleware, getGroupController);

router.post("/create", authMiddleware, createGroupController);
router.post("/leave", authMiddleware, leaveGroupController);
router.post("/join", authMiddleware, joinGroupController);

router.post("/join/request", authMiddleware, requestToJoinGroupController);
router.post("/join/approve", authMiddleware, approveJoinRequestController);
router.post("/join/deny", authMiddleware, denyJoinRequestController);
router.get("/join/requests/:groupId", authMiddleware, getJoinRequestsByGroupController);

router.get("/members/:groupId", authMiddleware, getGroupMembersController); 
router.post("/kick", authMiddleware, kickGroupMemberController); 

export default router;