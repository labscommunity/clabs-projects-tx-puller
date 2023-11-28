import logic from "../src/logic";
import * as dotenv from "dotenv";
dotenv.config();

test("if getTransactions() works", async () => {
  const startUnix = 1286848;
  const endUnix = 1287148;
  const res = await logic(
    "lorimerjenkins1@gmail.com",
    "Lorimer",
    startUnix,
    endUnix,
  );
  expect(res).toEqual(true);
}, 100000);
