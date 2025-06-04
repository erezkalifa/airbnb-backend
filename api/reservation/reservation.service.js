import { ObjectId } from "mongodb";
import { logger } from "../../services/logger.service.js";
import { dbService } from "../../services/db.service.js";

export const reservationService = {
  remove,
  query,
  getById,
  add,
  update,
  // addReservationMsg,
  // removeReservationMsg,
};
2;
async function query() {
  try {
    const collection = await dbService.getCollection("reservation");
    var reservationCursor = await collection.find();

    const reservations = await reservationCursor.toArray();
    return reservations;
  } catch (err) {
    logger.error("cannot find reservations", err);
    throw err;
  }
}

async function getById(reservationId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(reservationId) };

    const collection = await dbService.getCollection("reservation");
    const reservation = await collection.findOne(criteria);

    return reservation;
  } catch (err) {
    logger.error(`while finding reservation ${reservationId}`, err);
    throw err;
  }
}

async function remove(reservationId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(reservationId) };

    const collection = await dbService.getCollection("reservation");
    const res = await collection.deleteOne(criteria);

    if (res.deletedCount === 0) throw "Reservation not found";
    return reservationId;
  } catch (err) {
    logger.error(`cannot remove reservation ${reservationId}`, err);
    throw err;
  }
}

// async function add(reservation) {
//   try {
//     const collection = await dbService.getCollection("reservation");
//     await collection.insertOne(reservation);

//     return reservation;
//   } catch (err) {
//     logger.error("cannot insert reservation", err);
//     throw err;
//   }
// }

async function add(reservation) {
  const reservationToAdd = {
    _id: new ObjectId(), // Explicitly create an ObjectId
    stayId: reservation.stayId,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    totalPrice: reservation.totalPrice,
    host: reservation.host,
    guestName: reservation.guestName,
    guestId: reservation.guestId,
  };

  // console.log("=== Prepared reservation to insert ===");
  // console.log(reservationToAdd);

  try {
    // console.log("=== Attempting to get collection ===");
    const collection = await dbService.getCollection("reservation");
    // console.log("=== Got collection ===");
    const result = await collection.insertOne(reservationToAdd);

    // console.log("=== InsertOne result ===");
    // console.log(result);

    // if (result.acknowledged) {
    //   console.log("Reservation added successfully:", reservationToAdd);
    // } else {
    //   console.log("Reservation insertion not acknowledged:", result);
    // }

    return reservationToAdd;
  } catch (err) {
    logger.error("cannot insert reservation", err);
    throw err;
  }
}

async function update(reservation) {
  //Need to check if updating is available

  const reservationToSave = {
    stayId: reservation.stayId,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    totalPrice: reservation.totalPrice,
  };

  try {
    const criteria = { _id: ObjectId.createFromHexString(reservation._id) };
    const collection = await dbService.getCollection("reservation");
    await collection.updateOne(criteria, { $set: reservationToSave });

    return reservation;
  } catch (err) {
    logger.error(`cannot update reservation ${reservation._id}`, err);
    throw err;
  }
}

// async function addReservationMsg(reservationId, msg) {
//   try {
//     const criteria = { _id: reservationId };
//     msg.id = makeId();

//     const collection = await dbService.getCollection("reservation");
//     await collection.updateOne(criteria, { $push: { msgs: msg } });

//     return msg;
//   } catch (err) {
//     logger.error(`cannot add reservation msg ${reservationId}`, err);
//     throw err;
//   }
// }

// async function removeReservationMsg(reservationId, msgId) {
//   try {
//     const criteria = { _id: reservationId };

//     const collection = await dbService.getCollection("reservation");
//     await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } });

//     return msgId;
//   } catch (err) {
//     logger.error(`cannot remove reservation msg ${reservationId}`, err);
//     throw err;
//   }
// }
