import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import {
  createContact,
  listContacts,
  updateContactStatus,
} from "../controllers/contactController.js";

const router = Router();

// Public submit
router.post("/", createContact);

// Admin endpoints
router.get("/", authRequired, requireRole(["admin", "manager"]), listContacts);
router.patch(
  "/:id",
  authRequired,
  requireRole(["admin", "manager"]),
  updateContactStatus
);

export default router;
