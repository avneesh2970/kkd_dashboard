
// otp api
// import axios from "axios";

// export const sendSmsOtp = async (phone, otp) => {
//   try {
//     const mobile = phone.replace(/\D/g, ""); // ensure 10 digits

//     const response = await axios.get(
//       "https://www.fast2sms.com/dev/bulkV2",
//       {
//         params: {
//           authorization: process.env.FAST2SMS_API_KEY,
//           route: "otp",
//           variables_values: otp,
//           numbers: mobile,
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error(
//       "❌ SMS send error:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };



//quick sms api
import axios from "axios";

export const sendSmsOtp = async (phone, otp) => {
  try {
    const mobile = phone.replace(/\D/g, "");

    const message = `Your OTP for password reset is ${otp}. This OTP is valid for 5 minutes. Do not share it with anyone.`;

    const response = await axios.get(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        params: {
          authorization: process.env.FAST2SMS_API_KEY,
          route: "q",              // 👈 QUICK API
          message: message,
          numbers: mobile,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Quick SMS send error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
