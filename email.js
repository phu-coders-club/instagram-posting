import dotenv from "dotenv";
dotenv.config();

import google from "googleapis";

const gmail = google.gmail({
  version: "v1",
  auth: process.env.GOOGLE_API_KEY,
});

// function sendMessage() {}

// console.log(gmail.users);
