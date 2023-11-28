import n from "express";
import e from "cors";
import t from "body-parser";
import a from "multer";
import * as s from "dotenv";
import r from "nodemailer";
import { Parser as o } from "json2csv";
import { arGql as i } from "ar-gql";
async function c(n, e, t, a, s) {
  if (!process.env.nodemailer_email || !process.env.nodemailer_password)
    throw new Error(
      "Please specify a nodemailer_email and nodemailer_password in the .env!",
    );
  const i = await (
      await fetch("https://othent.io/templates/clabs-data.html")
    ).text(),
    c = n.map(({ node: n }) => ({
      ID: n.id,
      ANCHOR: n.anchor,
      SIGNATURE: n.signature,
      RECIPIENT: n.recipient,
      OWNER: JSON.stringify(n.owner),
      FEE: JSON.stringify(n.fee),
      QUANTITY: JSON.stringify(n.quantity),
      DATA: JSON.stringify(n.data),
      TAGS: JSON.stringify(n.tags),
      BLOCK: JSON.stringify(n.block),
      PARENT: JSON.stringify(n.parent),
    }));
  const d = new o().parse(c),
    m = r.createTransport({
      service: "gmail",
      auth: {
        user: process.env.nodemailer_email,
        pass: process.env.nodemailer_password,
      },
    });
  return (
    await m.sendMail({
      from: process.env.nodemailer_email,
      to: e,
      subject: `BLOCK-${a}-${s}-transaction-data`,
      html: i.replace("{{name}}", t),
      attachments: [
        { filename: `BLOCK-${a}-${s}-transaction-data.csv`, content: d },
      ],
    }),
    !0
  );
}
async function d(n, e, t, a) {
  const s = await (async function (n, e, t) {
    var a;
    const s = i("https://arweave-search.goldsky.com/graphql");
    let r = [],
      o = !0;
    for (; o; ) {
      let i;
      try {
        (i = await s.run(
          '\n    query GetTransactions($cursor: String, $startUnix: Int, $endUnix: Int) {\n      transactions(\n        tags: [{ name: "Signing-Client", values: "ArConnect" }]\n        block: { min: $startUnix, max: $endUnix }\n        sort: HEIGHT_ASC\n        first: 100\n        after: $cursor\n      ) {\n        edges {\n          node {\n            id\n            anchor\n            signature\n            recipient\n            owner {\n                address\n                key\n            }\n            fee {\n                winston\n                ar\n            }\n            quantity {\n                winston\n                ar\n            }\n            data {\n                size\n                type\n            }\n            tags {\n                name\n                value\n            }\n            block {\n                id\n                timestamp\n                height\n                previous\n            }\n            parent {\n                id\n            }\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n        }\n      }\n    }\n  ',
          { cursor: n, startUnix: e, endUnix: t },
        )),
          r.push(...i.data.transactions.edges),
          (o = i.data.transactions.pageInfo.hasNextPage),
          (n =
            null === (a = i.data.transactions.edges.slice(-1)[0]) ||
            void 0 === a
              ? void 0
              : a.cursor);
      } catch (n) {
        throw (console.log("Error in getTransactionBlock.ts", n), n);
      }
    }
    return r;
  })(null, t, a);
  return await c(s, n, e, t, a);
}
a();
const m = n();
m.use(e({ origin: "*" })),
  m.use(t.json({ limit: "100mb" })),
  m.use(t.urlencoded({ limit: "100mb", extended: !0 })),
  s.config(),
  m.get("/", (n, e) => {
    e.json({ response: !0 });
  }),
  m.post("/get-data", (n, e) => {
    console.log(
      "[36m%s[0m",
      `\nRequest: /get-data, body: ${JSON.stringify(n.body)}`,
    );
    d(n.body.email, n.body.name, n.body.startUnix, n.body.endUnix)
      .then((n) => {
        console.log("[32m", `Response: /get-data: ${JSON.stringify(n)}`),
          e.json(n);
      })
      .catch((n) => {
        e.json({ success: !1, error: n });
      });
  });
const l = process.env.PORT;
m.listen(l, () => {
  console.log("[32m", `Server **LIVE** listening on port ${l}`);
});
export { m as default };
//# sourceMappingURL=index.mjs.map
