import { Request } from "express";
import { Availability } from "../DB/models/post.model";

export const AvailabilityPost = (req:Request) => {
  return [
{ availability: Availability.public },
{ owner: req.user?._id },
{ availability: Availability.friends,friends: { $in: [req.user?._id]}}
  ];
};