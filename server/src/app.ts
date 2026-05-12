import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import UserRoutes from "./routes/user.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
//test pipelineCI/CD
app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoutes);
 
app.use("/users", UserRoutes);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get("/", (req, res) => {
  res.json({ message: "API is running " });
});

export default app;