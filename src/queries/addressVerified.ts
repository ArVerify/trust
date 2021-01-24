export default `
query transactions($addr: String!, $cursor: String) {
  transactions(
    tags: [
      { name: "Application", values: "ArVerify" }
      { name: "Action", values: "Verification" }
      { name: "Method", values: "Link" }
    ]
    first: 100
    after: $cursor
    owners: [$addr]
  ) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        recipient
      }
    }
  }
}
`;
