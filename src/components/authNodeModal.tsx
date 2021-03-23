import { Modal, useModal } from "@geist-ui/react";
import AuthNodeCard from "./authNodeCard";
import { getFee, verify } from "arverify";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useRouter } from "next/router";
import Arweave from "arweave";
import { arToUsd } from "../utils/pricing";

const AuthNodeModal = forwardRef((props, ref) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notEnoughBalance, setNotEnoughBalance] = useState(false);

  const [nodeFeeAR, setNodeFeeAR] = useState(0);
  const [nodeFeeUSD, setNodeFeeUSD] = useState(0);

  const { setVisible, bindings } = useModal();

  const arweave = new Arweave({
    host: "arweave.net", // Hostname or IP address for a Arweave host
    port: 443, // Port
    protocol: "https", // Network protocol http or https
    timeout: 20000, // Network request timeouts in milliseconds
    logging: false, // Enable network request logging
  });

  useImperativeHandle(ref, () => ({
    open() {
      setVisible(true);
    },
  }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotEnoughBalance(false);

      // get fee
      const nodeVerificationFeeAR = await getFee();
      // check users balance
      // @ts-ignore
      const winstonBalance = await arweave.wallets.getBalance(props.address);
      const balance = parseFloat(arweave.ar.winstonToAr(winstonBalance));

      setNodeFeeAR(nodeVerificationFeeAR);
      const nodeVerificationFeeUSD = await arToUsd(nodeVerificationFeeAR);
      setNodeFeeUSD(nodeVerificationFeeUSD);

      // check user has enough balance
      if (balance <= nodeVerificationFeeAR) {
        // todo show error
        setNotEnoughBalance(true);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <>
      {/* AuthNodeModal */}
      <Modal {...bindings}>
        <Modal.Title>Verify with Google</Modal.Title>
        <Modal.Subtitle style={{ textTransform: "none" }}>
          Verify using an AuthNode
        </Modal.Subtitle>
        <Modal.Content>
          <AuthNodeCard {...{ loading, nodeFeeAR, nodeFeeUSD }} />
        </Modal.Content>
        <Modal.Action passive onClick={() => setVisible(false)}>
          Cancel
        </Modal.Action>
        <Modal.Action
          loading={loading}
          disabled={notEnoughBalance}
          onClick={async () => {
            setLoading(true);
            const keyfile = JSON.parse(localStorage.getItem("keyfile"));
            if (keyfile) {
              const url = await verify(
                keyfile,
                "https://trust.arverify.org?verification=successful"
              );
              setLoading(false);
              await router.push(url);
            }
            setVisible(false);
          }}
        >
          Verify using Google
        </Modal.Action>
      </Modal>
    </>
  );
});

export default AuthNodeModal;
