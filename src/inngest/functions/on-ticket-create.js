import { inngest } from "../client.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import Ticket from "../../models/ticket.model.js";
import User from "../../models/user.model.js";
import analyzeTicket from "../../utils/ai-agent.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        console.log("ticket ID pass into inngest:=", ticketId)
        const ticketObject = await Ticket.findById(ticketId);
        
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }

        return ticketObject;
      });

      // update ticket status
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticketId, { status: "TODO" });
      });

      // 
      const aiResponse = await analyzeTicket(ticket);

      console.log("aiResponse:=", aiResponse)

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];

        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills.map((s) => s.toLowerCase()),
          });
        }

        skills = aiResponse.relatedSkills;

        return skills;
      });

      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedSkills.join("|"),
              $options: "i",
            },
          },
        });

        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }

        console.log("assigned user:=", user);

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });

        return user;
      });

      await step.run("send-email.notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);

          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
          );
        }
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error running the step", error.message);
      return { success: false };
    }
  }
);
