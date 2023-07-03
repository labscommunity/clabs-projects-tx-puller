const { arGql } = require("ar-gql");
const { writeFileSync, fstat, write, writeFile } = require("fs");
const { join } = require("path");

const gql = arGql("https://ar-io.dev/graphql");

(async () => {
  let weeks = {};

  const getWeekNum = (time) => {
    const start = new Date(time.getFullYear(), 0, 1);

    const days = Math.floor((time - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);

    return weekNumber;
  }

  const loop = async (cursor) => {
    const res = await gql.run(`query {
      transactions(
        tags: [{ name: "Signing-Client", values: "ArConnect" }]
        sort: HEIGHT_ASC
        first: 100
        ${cursor ? ("after: " + cursor) : ""}
      ) {
        edges {
          node {
            owner {
              address
            }
            block {
              timestamp
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
        }
      }
    }`);

    for (const { node } of res.data.transactions.edges) {
      if (Object.values(weeks).find(val => val.includes(node.owner.address))) {
        continue;
      }

      const time = new Date(node.block.timestamp * 1000)
      let weekNumber = getWeekNum(time);

      if (weekNumber === 0) {
        time.setDate(time.getDate() - 7);
        
        weekNumber = getWeekNum(time.getTime()) + 1;
      }
        
      if (!weeks[time.getFullYear() + "-" + weekNumber]) {
        weeks[time.getFullYear() + "-" + weekNumber] = [node.owner.address];
      } else {
        weeks[time.getFullYear() + "-" + weekNumber].push(node.owner.address);
      }
    }

    if (res.data.transactions.pageInfo.hasNextPage) {
      await loop(res.data.transactions.edges[res.data.transactions.edges.length - 1].cursor);
    }
  };

  await loop();

  writeFileSync(join(__dirname, "data.json"), new TextEncoder().encode(JSON.stringify(weeks, null, 2)));
})();
