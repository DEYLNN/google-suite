import { google } from "googleapis";
import fs from "fs";

// ================= CONFIG =================
const DOMAIN = "yah.biz.id";
const ORG_UNIT_PATH = "/Dani Kurniawan(200)";
// ==========================================

// Load OAuth token
const auth = new google.auth.OAuth2();
const tokens = JSON.parse(fs.readFileSync("auth/token.json"));
auth.setCredentials(tokens);

// Admin SDK
const admin = google.admin({
  version: "directory_v1",
  auth,
});

// Utils random
function rand(len = 6) {
  return Math.random().toString(36).slice(-len);
}

function generatePassword() {
  return "Bandulan113";
}

// MAIN
async function createRandomUser() {
  const firstName = rand(6);
  const lastName = rand(6);
  const email = `${rand(5)}${rand(3)}@${DOMAIN}`;
  const password = generatePassword();

  const res = await admin.users.insert({
    requestBody: {
      primaryEmail: email,
      name: {
        givenName: firstName,
        familyName: lastName,
      },
      password,
      orgUnitPath: ORG_UNIT_PATH,
      changePasswordAtNextLogin: false,
    },
  });

  console.log("✅ USER CREATED");
  console.log({
    firstName,
    lastName,
    email,
    password,
    orgUnitPath: ORG_UNIT_PATH,
    id: res.data.id,
  });
}

// RUN
createRandomUser().catch((err) => {
  console.error("❌ ERROR:", err.errors || err.message);
});
