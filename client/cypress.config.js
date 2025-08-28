import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CLIENT_URL || "http://127.0.0.1:5173",
    env: {
      API_BASE: process.env.API_BASE || "http://127.0.0.1:3002",
      STUDENT_LOGIN_PATH: "/student/login",
      STUDENT_DASHBOARD_PATH: "/student/dashboard",
    },
    video: false,
    chromeWebSecurity: false,
  },
});