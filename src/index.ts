import dotenv from "dotenv";
import { fastifyServer } from "./fastifyServer";

dotenv.config();

const port = process.env.PORT || "8080";

fastifyServer.listen(port);
