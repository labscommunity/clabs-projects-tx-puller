import logic from '../src/logic'
import * as dotenv from "dotenv";
dotenv.config();

test("if getTransactions() works", async () => {
  const startUnix = 1308972;
  const endUnix = 1308988;
  const res = await logic("lorimerjenkins1@gmail.com", "Lorimer", startUnix, endUnix);
  expect(res).toEqual(true);
}, 10000);
