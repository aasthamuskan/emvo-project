import express from "express";
import cors from "cors";
import { sendRouter } from "./routes/send";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "emvo-channel-service" });
});

app.use("/send", sendRouter);

app.listen(PORT, () => {
  console.log(`[ChannelService] Running on port ${PORT}`);
});

export default app;
