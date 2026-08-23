export const sendSMS = async (to, message) => {
  try {
    console.log("\n📱 SMS SENT");
    console.log("────────────────────────");
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log("────────────────────────\n");

    return {
      success: true,
      to,
      message
    };
  } catch (error) {
    console.error("❌ SMS failed:", error.message);
    throw error;
  }
};