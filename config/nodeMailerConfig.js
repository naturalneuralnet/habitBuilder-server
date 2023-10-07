import nodemailer from "nodemailer";

// console.log("INSIDE NODEMAILER");
// console.log(process.env.REFRESH_TOKEN_SECRET);
// console.log(process.env.PORT);

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
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=https://habitmaker.onrender.com/auth/verify/${confirmationCode}> Click here</a>
        </div>`,
    })
    .catch((err) => console.log(err));
};

export default sendConfirmationEmail;
