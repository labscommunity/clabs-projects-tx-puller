import { sendEmail } from "./src/utils/sendEmail";
import { getTransactionBlock } from "./src/gql/getTransactionBlock";

export async function index(email: string, name: string) {
  const startUnix = 1308972;
  const endUnix = 1308988;
  const transactions = await getTransactionBlock(null, startUnix, endUnix);

  console.log("transactions", transactions);

  const emailRes = await sendEmail(
    transactions,
    email,
    name,
    startUnix,
    endUnix,
  );

  return emailRes;
}
