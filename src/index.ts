import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
const upload = multer();
const app: express.Application = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
import * as dotEnv from "dotenv";
dotEnv.config();

// Home (ping)
app.get("/", (req: express.Request, res: express.Response) => {
  res.json({ response: true });
});

// Get Data
import logic from "./logic";
app.post("/get-data", (req: express.Request, res: express.Response) => {
  console.log(
    "\x1b[36m%s\x1b[0m",
    `\nRequest: /get-data, body: ${JSON.stringify(req.body)}`,
  );
  const email = req.body.email;
  const name = req.body.name;
  const startUnix = req.body.startUnix;
  const endUnix = req.body.endUnix;
  logic(email, name, startUnix, endUnix)
    .then((response: any) => {
      console.log(
        "\x1b[32m",
        `Response: /get-data: ${JSON.stringify(response)}`,
      );
      res.json(response);
    })
    .catch((error: Error) => {
      res.json({ success: false, error: error });
    });
});

// Start up server
const port = process.env.PORT;
app.listen(port, () => {
  console.log("\x1b[32m", `Server **LIVE** listening on port ${port}`);
});

export default app;