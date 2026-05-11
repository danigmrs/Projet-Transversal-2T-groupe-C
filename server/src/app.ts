import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import cookieParser from "cookie-parser";
>>>>>>> 5571292bbdf52757baf06d3e132eb8b144aced3d

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoutes);
<<<<<<< HEAD
app.use("/users", UserRoutes);
=======

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

>>>>>>> 5571292bbdf52757baf06d3e132eb8b144aced3d
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

export default app;