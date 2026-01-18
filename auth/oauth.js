import { google } from "googleapis";
import fs from "fs";
import { configDotenv } from "dotenv";
configDotenv();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
console.log(process.env.REDIRECT_URI);

export function getAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/admin.directory.user"],
  });
}

export async function saveToken(code) {
  const { tokens } = await oAuth2Client.getToken(code);

  // 🔽 TAMBAHKAN DI SINI
  const tokensWithWIB = {
    ...tokens,
    expiry_date_wib: toWIB(tokens.expiry_date),
  };
  fs.writeFileSync("auth/token.json", JSON.stringify(tokensWithWIB, null, 2));
  return tokensWithWIB;
}

export function loadAuth() {
  let tokens;
  try {
    tokens = JSON.parse(fs.readFileSync("auth/token.json"));
  } catch (err) {
    if (err.code === "ENOENT") {
      // File tidak ada, buat file kosong
      fs.writeFileSync("auth/token.json", JSON.stringify({}, null, 2));
      throw new Error(
        "Token OAuth belum ada. Silakan login dulu melalui /auth/login"
      );
    } else {
      throw err;
    }
  }
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

function toWIB(timestampMs) {
  return new Date(timestampMs).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
  });
}
