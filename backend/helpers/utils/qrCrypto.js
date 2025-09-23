import crypto from "crypto";

export const generateUID = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uid = "";
  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    uid += chars[randomIndex];
  }
  return uid;
};
