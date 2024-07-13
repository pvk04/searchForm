import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { appRouter } from "./routes/index.js";

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());
app.use(appRouter);

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
