import { Router } from "express";
import bodyParser from "body-parser";
import { searchController } from "../controllers/index.js";

export const appRouter = Router();
appRouter.use(bodyParser.json());

appRouter.use("/search", searchController);
