import React, { useEffect, useState } from "react";
import { getFee } from "arverify";
import { Code, Loading, Note, Popover, Spacer, Text } from "@geist-ui/react";
import { arToUsd } from "../utils/pricing";
import SelectMultipleValue from "@geist-ui/react/dist/select/select-multiple-value";

const AuthNodeCard = () => {
  const [nodeFeeAR, setNodeFeeAR] = useState(0);
  const [nodeFeeUSD, setNodeFeeUSD] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const nodeVerificationFeeAR = await getFee();
      setNodeFeeAR(nodeVerificationFeeAR);
      const nodeVerificationFeeUSD = await arToUsd(nodeVerificationFeeAR);
      setNodeFeeUSD(nodeVerificationFeeUSD);
      setLoading(false);
    })();
  }, []);

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
