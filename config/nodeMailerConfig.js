import nodemailer from "nodemailer";

const sendConfirmationEmail = (sender, pass, name, email, confirmationCode) => {
  const transport = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: sender,
      pass: pass,
    },
  });

  transport
    .sendMail({
      from: sender,
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for signing up. Please confirm your email by clicking on the following link</p>
        <a href=https://habitmaker.onrender.com/auth/verify/${confirmationCode}> Click here</a>
        <p>Please note this website is still under construction and your data may be purged at any time.</p>
        </div>`,
    })
    .catch((err) => console.log(err));
};

export default sendConfirmationEmail;
