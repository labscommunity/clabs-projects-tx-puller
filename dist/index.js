"use strict";
var n = require("express"),
  e = require("cors"),
  t = require("body-parser"),
  r = require("multer"),
  a = require("dotenv"),
  s = require("nodemailer"),
  i = require("json2csv"),
  o = require("ar-gql");
function c(n) {
  var e = Object.create(null);
  return (
    n &&
      Object.keys(n).forEach(function (t) {
        if ("default" !== t) {
          var r = Object.getOwnPropertyDescriptor(n, t);
          Object.defineProperty(
            e,
            t,
            r.get
              ? r
              : {
                  enumerable: !0,
                  get: function () {
                    return n[t];
                  },
                },
          );
        }
      }),
    (e.default = n),
    Object.freeze(e)
  );
}
var l = c(a);
async function d(n, e, t, r, a) {
  if (!process.env.nodemailer_email || !process.env.nodemailer_password)
    throw new Error(
      "Please specify a nodemailer_email and nodemailer_password in the .env!",
    );
  const o = await (
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
  const l = new i.Parser().parse(c),
    d = s.createTransport({
      service: "gmail",
      auth: {
        user: process.env.nodemailer_email,
        pass: process.env.nodemailer_password,
      },
    });
  return (
    await d.sendMail({
      from: process.env.nodemailer_email,
      to: e,
      subject: `BLOCK-${r}-${a}-transaction-data`,
      html: o.replace("{{name}}", t),
      attachments: [
        { filename: `BLOCK-${r}-${a}-transaction-data.csv`, content: l },
      ],
    }),
    !0
  );
}
async function u(n, e, t, r) {
  const a = await (async function (n, e, t) {
    var r;
    const a = o.arGql("https://arweave-search.goldsky.com/graphql");
    let s = [],
      i = !0;
    for (; i; ) {
      let o;
      try {
        (o = await a.run(
          '\n    query GetTransactions($cursor: String, $startUnix: Int, $endUnix: Int) {\n      transactions(\n        tags: [{ name: "Signing-Client", values: "ArConnect" }]\n        block: { min: $startUnix, max: $endUnix }\n        sort: HEIGHT_ASC\n        first: 100\n        after: $cursor\n      ) {\n        edges {\n          node {\n            id\n            anchor\n            signature\n            recipient\n            owner {\n                address\n                key\n            }\n            fee {\n                winston\n                ar\n            }\n            quantity {\n                winston\n                ar\n            }\n            data {\n                size\n                type\n            }\n            tags {\n                name\n                value\n            }\n            block {\n                id\n                timestamp\n                height\n                previous\n            }\n            parent {\n                id\n            }\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n        }\n      }\n    }\n  ',
          { cursor: n, startUnix: e, endUnix: t },
        )),
          s.push(...o.data.transactions.edges),
          (i = o.data.transactions.pageInfo.hasNextPage),
          (n =
            null === (r = o.data.transactions.edges.slice(-1)[0]) ||
            void 0 === r
              ? void 0
              : r.cursor);
      } catch (n) {
        throw (console.log("Error in getTransactionBlock.ts", n), n);
      }
    }
    return s;
  })(null, t, r);
  return await d(a, n, e, t, r);
}
r();
const g = n();
g.use(e({ origin: "*" })),
  g.use(t.json({ limit: "100mb" })),
  g.use(t.urlencoded({ limit: "100mb", extended: !0 })),
  l.config(),
  g.get("/", (n, e) => {
    e.json({ response: !0 });
  }),
  g.post("/get-data", (n, e) => {
    console.log(
      "[36m%s[0m",
      `\nRequest: /get-data, body: ${JSON.stringify(n.body)}`,
    );
    u(n.body.email, n.body.name, n.body.startUnix, n.body.endUnix)
      .then((n) => {
        console.log("[32m", `Response: /get-data: ${JSON.stringify(n)}`),
          e.json(n);
      })
      .catch((n) => {
        e.json({ success: !1, error: n });
      });
  });
const m = process.env.PORT;
g.listen(m, () => {
  console.log("[32m", `Server **LIVE** listening on port ${m}`);
}),
  (module.exports = g);
//# sourceMappingURL=index.js.map
