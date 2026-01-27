import { PORT } from "./config.js";
import cors from "cors";
import express from "express";
import usersRoutes from "./routes/users.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import morgan from "morgan";

const app = express();
app.use(cors());
app.use(morgan("dev"));

// middlewares
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));

app.use(usersRoutes);
app.use(inventoryRoutes);
app.use(dashboardRoutes);
app.listen(PORT);

// eslint-disable-next-line no-console
console.log("Server on port", PORT);