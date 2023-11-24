import nodemailer from "nodemailer";
import { Parser } from "json2csv";

type TransactionNode = {
  id: string;
  anchor: string;
  signature: string;
  recipient: string;
  owner: any;
  fee: any;
  quantity: any;
  data: any;
  tags: any[];
  block: any;
  parent: any;
};

type Transaction = {
  node: TransactionNode;
};

function flattenData(data: Transaction[]): any[] {
  return data.map(({ node }) => ({
    ID: node.id,
    ANCHOR: node.anchor,
    SIGNATURE: node.signature,
    RECIPIENT: node.recipient,
    OWNER: JSON.stringify(node.owner),
    FEE: JSON.stringify(node.fee),
    QUANTITY: JSON.stringify(node.quantity),
    DATA: JSON.stringify(node.data),
    TAGS: JSON.stringify(node.tags),
    BLOCK: JSON.stringify(node.block),
    PARENT: JSON.stringify(node.parent),
  }));
}

export async function sendEmail(
  transactions: Transaction[],
  email: string,
  name: string,
  startUnix: number,
  endUnix: number,
): Promise<boolean> {
  if (!process.env.nodemailer_email || !process.env.nodemailer_password) {
    throw new Error(
      "Please specify a nodemailer_email and nodemailer_password in the .env!",
    );
  }

  const template = await (
    await fetch("https://othent.io/templates/clabs-data.html")
  ).text();

  const flattenedData = flattenData(transactions);

  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(flattenedData);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.nodemailer_email,
      pass: process.env.nodemailer_password,
    },
  });

  await transporter.sendMail({
    from: process.env.nodemailer_email,
    to: email,
    subject: `BLOCK-${startUnix}-${endUnix}-transaction-data`,
    html: template.replace("{{name}}", name),
    attachments: [
      {
        filename: `BLOCK-${startUnix}-${endUnix}-transaction-data.csv`,
        content: csv,
      },
    ],
  });

  return true;
}
