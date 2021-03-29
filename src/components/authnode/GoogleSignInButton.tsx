import { Badge, Button, useTheme } from "@geist-ui/react";
import GoogleIcon from "../logos/google";
import React, { useRef } from "react";
import AuthNodeModal from "../authNodeModal";

const GoogleSignInButton = (props) => {
  const theme = useTheme();
  const authNodeModal = useRef();

  const verified = props.verified;

  return (
    <>
      <Badge.Anchor>
        <Badge
          type="success"
          style={{
            border: `1px solid ${theme.palette.successLight}`,
          }}
        >
          BETA
        </Badge>
        <Button
          type="success-light"
          // @ts-ignore
          onClick={() => authNodeModal.current.open()}
          className="arverify-button"
          // todo fix library
          //disabled={verified}
          disabled={true}
        >
          <GoogleIcon />
          {verified ? "Already verified" : "Verify with Google"}
        </Button>
      </Badge.Anchor>
      <AuthNodeModal {...{ address: props.addr }} ref={authNodeModal} />
    </>
  );
};

export default GoogleSignInButton;
