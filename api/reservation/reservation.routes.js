import express from "express";

import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import { log } from "../../middlewares/logger.middleware.js";
import {
  getReservations,
  getReservationById,
  addReservation,
  updateReservation,
  removeReservation,
  addReservationMsg,
  removeReservationMsg,
} from "./reservation.controller.js";

const router = express.Router();

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get("/", log, getReservations);
router.get("/:id", log, getReservationById);
router.post("/", log, addReservation);
// router.post("/", log, requireAuth, addReservation);
router.put("/:id", updateReservation);
// router.put("/:id", requireAuth, updateReservation);
router.delete("/:id", removeReservation);
// router.delete("/:id", requireAuth, removeReservation);

router.post("/:id/msg", requireAuth, addReservationMsg);
router.delete("/:id/msg/:msgId", requireAuth, removeReservationMsg);

export const reservationRoutes = router;
