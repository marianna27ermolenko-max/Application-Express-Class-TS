import dotenv from 'dotenv'
dotenv.config()

import express from "express";
import { setupApp } from "./setup-app";
import { SETTINGS } from "./common/settings/setting";
import { runDB } from "./db/mongo.db";

const bootstrap = async () => {
  const app = express();
  setupApp(app);
  const PORT = SETTINGS.PORT;

  
  try {
    await runDB(SETTINGS.MONGO_URL);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1); // останавливаем приложение, если нет подключения к БД
  }

  app.listen(PORT, () => {
    console.log(`🚀 App listening on port ${PORT}`);
  });

  return app;
};

bootstrap();
