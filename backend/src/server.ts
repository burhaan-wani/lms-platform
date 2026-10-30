import "dotenv/config";

import { app } from "./app.js";
import { connectDB } from "./config/db.config.js";

const PORT = process.env.PORT || 3002;

let server: ReturnType<typeof app.listen>;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    console.log("Couldn't connect to server due to DB failure");
    process.exit(1);
  });

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(1);
  });
});
