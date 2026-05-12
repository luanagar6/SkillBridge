import express from "express";
import cors from "cors";
import geminiRouter from "./src/server/routes/gemini.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/gemini", geminiRouter);
app.listen(5001);