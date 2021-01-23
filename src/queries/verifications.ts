export default `
query($addr: String!, $cursor: String) {
  transactions(
    recipients: [$addr]
    tags: [
      { name: "Application", values: "ArVerify" }
      { name: "Action", values: "Verification" }
      { name: "Method", values: "Link" }
      { name: "Address", values: [$addr] }
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
