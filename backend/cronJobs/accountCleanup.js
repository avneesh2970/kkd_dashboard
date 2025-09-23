import cron from "node-cron";
import User from "../models/User.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";

// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily account cleanup...");

    const now = new Date();
    const usersToDelete = await User.find({
      isDeletionRequested: true,
      deletionDate: { $lte: now },
    });

    for (let user of usersToDelete) {
      // Delete related data if needed (withdrawals, etc.)
      await WithdrawalRequest.deleteMany({ user: user._id });

      // Finally, delete user
      await User.deleteOne({ _id: user._id });

      console.log(`Deleted user: ${user.email || user.phone}`);
    }
  } catch (err) {
    console.error("Error in account cleanup:", err);
  }
});
