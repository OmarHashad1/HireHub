import express, { Express, Request, Response } from "express";
import { PORT } from "./configs/env.js";

export const app = async () => {
  const APP: Express = express();

  //middleware
  APP.use(express.json());

  APP.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      message: "Test Server",
    });
  });

  APP.listen(PORT, () => {
    console.log(`Server running`);
  });
};
