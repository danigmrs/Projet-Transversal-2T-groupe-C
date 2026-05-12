import { Router } from "express";
import { ScoresController } from "../controllers/scores.controller";

const router = Router();

router.get("/top5", ScoresController.getTop5);
router.post("/", ScoresController.create);

export default router;