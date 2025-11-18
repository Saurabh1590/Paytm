import express from "express";
import { Router } from "express";
import cors from "cors"
import mainRouter from "./routes/index.js"
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1", mainRouter);

app.listen(3000, () => {
    console.log("Server is running");
})




