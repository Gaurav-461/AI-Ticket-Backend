import Ticket from "../models/ticket.model.js";
import { inngest } from "../inngest/client.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    console.table(req.body)

    if (!title || !description) {
      return res.status(401).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    console.log("new ticket:=", newTicket)
    console.log("User:=", req.user)

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("❌ Error creating ticket:=", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({tickets, success: true, message: "All Tickets fetched"});
  } catch (error) {
    console.error("❌ Error fetching tickets:- ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).select("title description status createdAt");
    }

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    return res.status(200).json({ success: true, ticket, message: "Ticket fetch successfully" });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
