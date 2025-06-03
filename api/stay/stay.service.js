import { ObjectId } from "mongodb";

import { logger } from "../../services/logger.service.js";
import { makeId } from "../../services/util.service.js";
import { dbService } from "../../services/db.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";

const PAGE_SIZE = 3;

export const stayService = {
  remove,
  query,
  getById,
  add,
  update,
  addStayMsg,
  removeStayMsg,
};

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy);
    const sort = _buildSort(filterBy);

    const collection = await dbService.getCollection("stay");

    const skip = (filterBy.page - 1) * filterBy.pageSize;

    // 🔎 Get the total number of matching stays
    const totalMatches = await collection.countDocuments(criteria);
    console.log("Total stays matching criteria:", totalMatches);

    // 🔎 Check if the requested page has results
    if (skip >= totalMatches) {
      console.log("Requested page exceeds available data. Returning empty array.");
      return [];
    }

    // ⚡ Get the paginated stays
    const stays = await collection.find(criteria)
      .sort(sort)
      .skip(skip)
      .limit(filterBy.pageSize)
      .toArray();

    console.log("Paginated stays:", stays);
    return stays;
  } catch (err) {
    logger.error("cannot find stays", err);
    throw err;
  }
}

async function getById(stayId) {
  try {
    const criteria = { _id: stayId };

    const collection = await dbService.getCollection("stay");
    const stay = await collection.findOne(criteria);

    //stay.createdAt = stay._id.getTimestamp()
    return stay;
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err);
    throw err;
  }
}

async function remove(stayId) {
  try {
    const criteria = {
      _id: stayId,
    };

    const collection = await dbService.getCollection("stay");
    const res = await collection.deleteOne(criteria);

    if (res.deletedCount === 0) throw "Stay not found";
    return stayId;
  } catch (err) {
    logger.error(`cannot remove stay ${stayId}`, err);
    throw err;
  }
}

async function add(stay) {
  try {
    const collection = await dbService.getCollection("stay");
    await collection.insertOne(stay);

    return stay;
  } catch (err) {
    logger.error("cannot insert stay", err);
    throw err;
  }
}

async function update(stay) {
  const stayToSave = { vendor: stay.vendor, speed: stay.speed };

  try {
    const criteria = { _id: stay._id };
    const collection = await dbService.getCollection("stay");
    await collection.updateOne(criteria, { $set: stayToSave });

    return stay;
  } catch (err) {
    logger.error(`cannot update stay ${stay._id}`, err);
    throw err;
  }
}

async function addStayMsg(stayId, msg) {
  try {
    const criteria = { _id: stayId };
    msg.id = makeId();

    const collection = await dbService.getCollection("stay");
    await collection.updateOne(criteria, { $push: { msgs: msg } });

    return msg;
  } catch (err) {
    logger.error(`cannot add stay msg ${stayId}`, err);
    throw err;
  }
}

async function removeStayMsg(stayId, msgId) {
  try {
    const criteria = { _id: stayId };

    const collection = await dbService.getCollection("stay");
    await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } });

    return msgId;
  } catch (err) {
    logger.error(`cannot remove stay msg ${stayId}`, err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};

  if (filterBy.txt) {
    criteria.name = { $regex: filterBy.txt, $options: "i" };
  }

  if (filterBy.city) {
    criteria["loc.city"] = { $regex: filterBy.city, $options: "i" };
  }

  if (filterBy.bathrooms !== undefined) {
    criteria.bathrooms = { $gte: +filterBy.bathrooms };
  }

  if (filterBy.bedrooms !== undefined) {
    criteria.bedrooms = { $gte: +filterBy.bedrooms };
  }

  if (filterBy.minPrice !== undefined || filterBy.maxPrice !== undefined) {
    criteria.price = {};
    if (filterBy.minPrice !== undefined)
      criteria.price.$gte = +filterBy.minPrice;
    if (filterBy.maxPrice !== undefined)
      criteria.price.$lte = +filterBy.maxPrice;
  }

  if (filterBy.capacity !== undefined) {
    criteria.capacity = { $gte: +filterBy.capacity };
  }

  if (filterBy.guests) {
    const totalGuests =
      (filterBy.guests.adults || 0) + (filterBy.guests.children || 0);
    if (totalGuests > 0) {
      criteria.capacity = { $gte: totalGuests };
    }
  }

  if (filterBy.roomType) {
    criteria.roomType = filterBy.roomType;
  }

  if (filterBy.labels && filterBy.labels.length > 0) {
    const labels = Array.isArray(filterBy.labels) ? filterBy.labels : [filterBy.labels];
    criteria.labels = { $in: labels };
  }

  if (filterBy.checkIn && filterBy.checkOut) {
    criteria.availableFrom = { $lte: new Date(filterBy.checkIn) };
    criteria.availableTo = { $gte: new Date(filterBy.checkOut) };
  }

  return criteria;
}

function _buildSort(filterBy) {
  const validFields = ["price", "capacity", "bedrooms", "bathrooms"];
  if (!filterBy.sortField || !validFields.includes(filterBy.sortField))
    return {};
  const dir = +filterBy.sortDir || 1; // 1 for ascending, -1 for descending
  return { [filterBy.sortField]: dir };
}
