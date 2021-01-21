export default `
query($addr: String!, $cursor: String) {
  transactions(
    recipients: [$addr]
    tags: [
      { name: "App-Name", values: "ArVerify" }
      { name: "Action", values: "Verify" }
    ]
    after: $cursor
  ) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        id
      }
    }
  }
}
`;
