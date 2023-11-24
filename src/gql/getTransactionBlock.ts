import { arGql } from "ar-gql";

export async function getTransactionBlock(
  cursor: string | null,
  startUnix: number,
  endUnix: number,
) {
  const gql = arGql("https://arweave-search.goldsky.com/graphql");

  const query = `
    query GetTransactions($cursor: String, $startUnix: Int, $endUnix: Int) {
      transactions(
        tags: [{ name: "Signing-Client", values: "ArConnect" }]
        block: { min: $startUnix, max: $endUnix }
        sort: HEIGHT_ASC
        first: 100
        after: $cursor
      ) {
        edges {
          node {
            id
            anchor
            signature
            recipient
            owner {
                address
                key
            }
            fee {
                winston
                ar
            }
            quantity {
                winston
                ar
            }
            data {
                size
                type
            }
            tags {
                name
                value
            }
            block {
                id
                timestamp
                height
                previous
            }
            parent {
                id
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  let allTransactions = [];
  let hasNextPage = true;

  while (hasNextPage) {
    let response;
    try {
      response = await gql.run(query, { cursor, startUnix, endUnix });
      allTransactions.push(...response.data.transactions.edges);
      hasNextPage = response.data.transactions.pageInfo.hasNextPage;
      cursor = response.data.transactions.edges.slice(-1)[0]?.cursor;
    } catch (e) {
      console.log("Error in getTransactionBlock.ts", e);
      throw e;
    }
  }

  return allTransactions;
}
