import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  content,
}) => {
  if (!to) {
    throw new Error("Recipient email is required");
  }

  const result = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: content,
  });

  console.log(
    `📧 Email sent to ${to}: ${subject}`
  );

  return result;
};