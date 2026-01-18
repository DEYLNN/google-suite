import { google } from "googleapis";
import { loadAuth } from "../auth/oauth.js";

export function getAdminClient() {
  const auth = loadAuth();
  return google.admin({
    version: "directory_v1",
    auth,
  });
}
