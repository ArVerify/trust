import React, { useEffect, useState } from "react";
import { getFee } from "arverify";
import { Code, Text } from "@geist-ui/react";
import { arToUsd } from "../utils/pricing";

const AuthNodeCard = () => {
  const [nodeFeeAR, setNodeFeeAR] = useState(0);
  const [nodeFeeUSD, setNodeFeeUSD] = useState(0);

  useEffect(() => {
    (async () => {
      const nodeVerificationFeeAR = await getFee();
      setNodeFeeAR(nodeVerificationFeeAR);
      const nodeVerificationFeeUSD = await arToUsd(nodeVerificationFeeAR);
      setNodeFeeUSD(nodeVerificationFeeUSD);
    })();
  }, []);

  return (
    <>
      <Text>
        To verify with a Google-Account we use our ArVerify auth node system.
        For using it, we will send a{" "}
        <Code>
          {nodeFeeUSD} USD (~{nodeFeeAR.toFixed(4)} AR)
        </Code>{" "}
        tip to the AuthNode. Click the button below to start the verification
        process.
      </Text>
    </>
  );
};

export default AuthNodeCard;
