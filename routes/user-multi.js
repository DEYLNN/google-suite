import express from "express";
import { getAdminClient } from "../services/adminsdk.js";
import { faker } from "@faker-js/faker";

const router = express.Router();

// SLOT INFO
router.get("/slot-info", async (req, res) => {
  const admin = getAdminClient();
  const MAX_SLOT = 200;
  try {
    const users = await admin.users.list({
      customer: "my_customer",
      maxResults: MAX_SLOT,
    });
    const used = (users.data.users || []).length;
    res.json({ used, max: MAX_SLOT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// LIST USERS
router.get("/list", async (req, res) => {
  const admin = getAdminClient();
  try {
    const users = await admin.users.list({
      customer: "my_customer",
      maxResults: 200, // Increase to match MAX_SLOT
      orderBy: "email",
    });
    // Format waktu
    const formatDate = (iso) => {
      if (!iso) return "-";
      const d = new Date(iso);
      return d.toLocaleString("id-ID", { hour12: false });
    };
    let enriched = (users.data.users || []).map((u) => ({
      ...u,
      lastLogin: formatDate(u.lastLoginTime),
      created: formatDate(u.creationTime),
      _createdRaw: u.creationTime,
    }));
    enriched = enriched.sort(
      (a, b) => new Date(b._createdRaw) - new Date(a._createdRaw),
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE MULTIPLE USERS
router.post("/create-multi", async (req, res) => {
  const admin = getAdminClient();
  const DOMAIN = "yah.biz.id";
  const count = parseInt(req.body.count) || 1;
  const customEmail = req.body.customEmail && req.body.customEmail.trim();
  const results = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email =
      i === 0 && customEmail
        ? `${customEmail}@${DOMAIN}`
        : `${firstName.toLowerCase()}@${DOMAIN}`;
    const password = "Bandulan113";
    try {
      const user = await admin.users.insert({
        requestBody: {
          primaryEmail: email,
          name: { givenName: firstName, familyName: lastName },
          password,
          orgUnitPath: "/Dani Kurniawan(200)",
          changePasswordAtNextLogin: false,
        },
      });
      results.push({
        firstName,
        lastName,
        email,
        password,
        id: user.data.id,
        status: "CREATED",
      });
    } catch (err) {
      results.push({
        firstName,
        lastName,
        email,
        error: err.message,
        status: "FAILED",
      });
    }
  }
  res.json(results);
});

export default router;
