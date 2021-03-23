import React from "react";
import { Code, Loading, Note, Spacer, Text } from "@geist-ui/react";

const AuthNodeCard = (props) => {
  const loading = props.loading;
  const nodeFeeAR = props.nodeFeeAR;
  const nodeFeeUSD = props.nodeFeeUSD;

  return (
    <>
      <Text>
        To verify with a Google-Account we use our ArVerify auth node system.
        For using it, we will send a{" "}
        <Code>
          {loading ? (
            <Loading />
          ) : (
            <>
              {nodeFeeUSD} USD (~{nodeFeeAR.toFixed(4)} AR)
            </>
          )}
        </Code>{" "}
        tip. Click the button below to start the verification process.
        <Spacer y={0.8} />
        <Note>
          60% of the tip is sent to the AuthNode. 40% is sent to the ArVerify
          community.
        </Note>
      </Text>
    </>
  );
};

export default AuthNodeCard;
