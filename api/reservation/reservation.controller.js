import { logger } from "../../services/logger.service.js";
import { reservationService } from "./reservation.service.js";

export async function getReservations(req, res) {
  try {
    // const filterBy = {
    //   txt: req.query.txt || "",
    //   minSpeed: +req.query.minSpeed || 0,
    //   sortField: req.query.sortField || "",
    //   sortDir: req.query.sortDir || 1,
    //   pageIdx: req.query.pageIdx,
    //   labels: _normalizeLabels(req.query.labels),
    // };
    const reservations = await reservationService.query();
    res.json(reservations);
  } catch (err) {
    logger.error("Failed to get reservations", err);
    res.status(400).send({ err: "Failed to get reservations" });
  }
}

export async function getReservationById(req, res) {
  try {
    const reservationId = req.params.id;
    const reservation = await reservationService.getById(reservationId);
    res.json(reservation);
  } catch (err) {
    logger.error("Failed to get reservation", err);
    res.status(400).send({ err: "Failed to get reservation" });
  }
}

export async function addReservation(req, res) {
  const { body: reservation } = req;

  try {
    // reservation.owner = loggedinUser;
    const addedReservation = await reservationService.add(reservation);
    res.json(addedReservation);
  } catch (err) {
    logger.error("Failed to add reservation", err);
    res.status(400).send({ err: "Failed to add reservation" });
  }
}

export async function updateReservation(req, res) {
  const { body: reservation } = req;

  // const { loggedinUser, body: reservation } = req;
  // const { _id: userId, isAdmin } = loggedinUser;

  // if (!isAdmin && reservation.owner._id !== userId) {
  //   res.status(403).send("Not your reservation...");
  //   return;
  // }

  try {
    const updatedReservation = await reservationService.update(reservation);
    res.json(updatedReservation);
  } catch (err) {
    logger.error("Failed to update reservation", err);
    res.status(400).send({ err: "Failed to update reservation" });
  }
}

export async function removeReservation(req, res) {
  try {
    const reservationId = req.params.id;

    const removedId = await reservationService.remove(reservationId);

    res.send(removedId);
  } catch (err) {
    logger.error("Failed to remove reservation", err);
    res.status(400).send({ err: "Failed to remove reservation" });
  }
}

export async function addReservationMsg(req, res) {
  const { loggedinUser } = req;

  try {
    const reservationId = req.params.id;
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
    };
    const savedMsg = await reservationService.addReservationMsg(
      reservationId,
      msg
    );
    res.json(savedMsg);
  } catch (err) {
    logger.error("Failed to add reservation msg", err);
    res.status(400).send({ err: "Failed to add reservation msg" });
  }
}

export async function removeReservationMsg(req, res) {
  try {
    const { id: reservationId, msgId } = req.params;

    const removedId = await reservationService.removereservationMsg(
      reservationId,
      msgId
    );
    res.send(removedId);
  } catch (err) {
    logger.error("Failed to remove reservation msg", err);
    res.status(400).send({ err: "Failed to remove reservation msg" });
  }
}

function _normalizeLabels(labels) {
  if (Array.isArray(labels)) return labels;
  return (labels || "")
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}
