import { index } from "../index";
import * as dotenv from "dotenv";
dotenv.config();

test("if getTransactions() works", async () => {
  const res = await index("lorimerjenkins1@gmail.com", "Lorimer");
  expect(res).toEqual(true);
}, 10000);
