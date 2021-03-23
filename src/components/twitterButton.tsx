import { Twitter } from "react-feather";
import { Button } from "@geist-ui/react";
import React from "react";
import { useRouter } from "next/router";

const TwitterButton = (props) => {
  const router = useRouter();
  return (
    <Button
      type="success-light"
      onClick={() =>
        router.push(
          "https://twitter.com/intent/tweet?text=" +
            encodeURIComponent(
              `Hello everyone!\nPlease verify my Arweave address by using ArVerify here: https://${window.location.host}/verify/${props.addr}`
            )
        )
      }
      className="arverify-button"
    >
      <Twitter />
      Tweet verification link
    </Button>
  );
};

export default TwitterButton;
