export default `
query($addr: String!, $target: String!) {
  transactions(
    owners: [$addr]
    recipients: [$target]
    tags: [
      { name: "Application", values: "ArVerify" }
      { name: "Action", values: "Verification" }
      { name: "Method", values: "Link" }
      { name: "Address", values: [$target] }
    ]
    first: 1
  ) {
    edges {
      node {
        id
      }
    }
  }
}
`;
