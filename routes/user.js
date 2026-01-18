import express from "express";
import { getAdminClient } from "../services/adminsdk.js";

const router = express.Router();

// CREATE USER
router.post("/create", async (req, res) => {
  const admin = getAdminClient();

  await admin.users.insert({
    requestBody: {
      primaryEmail: req.body.email,
      name: {
        givenName: req.body.firstName,
        familyName: req.body.lastName,
      },
      password: req.body.password,
    },
  });

  res.json({ status: "USER CREATED" });
});

// DELETE USER
router.delete("/delete/:email", async (req, res) => {
  const admin = getAdminClient();
  await admin.users.delete({ userKey: req.params.email });
  res.json({ status: "USER DELETED" });
});

export default router;
