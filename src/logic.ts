import { sendEmail } from "./utils/sendEmail";
import { getTransactionBlock } from "./gql/getTransactionBlock";

export default async function logic(
  email: string,
  name: string,
  startUnix: number,
  endUnix: number,
) {
  const transactions = await getTransactionBlock(null, startUnix, endUnix);

  const emailRes = await sendEmail(
    transactions,
    email,
    name,
    startUnix,
    endUnix,
  );

  return emailRes;
}
