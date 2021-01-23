import Arweave from "arweave";
import {useRouter} from "next/router";
import {useState, useEffect} from "react";
import {
  useModal,
  Page,
  Row,
  Breadcrumbs,
  Text,
  Button,
  Modal,
  Card,
  Code, Link, Tooltip,
} from "@geist-ui/react";
import {all} from "ar-gql";
import verificationsQuery from "../../queries/verifications";
import {FileIcon} from "@primer/octicons-react";
import {selectTokenHolder} from "../../utils/community";

const client = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const Verify = () => {
  const router = useRouter();
  const [target, setTarget] = useState("");
  useEffect(() => {
    if (router.query.target) {
      setTarget(router.query.target.toString());
    }
  }, [router.query.target]);

  const [addr, setAddr] = useState("");
  useEffect(() => {
    (async () => {
      const keyfile = localStorage.getItem("keyfile");
      if (keyfile) {
        setAddr(await client.wallets.jwkToAddress(JSON.parse(keyfile)));
      }
    })();
  }, []);
  const {setVisible, bindings} = useModal();

  const [count, setCount] = useState(0);
  const [fee, setFee] = useState(0);
  useEffect(() => {
    (async () => {
      const gql = await all(verificationsQuery, {addr});
      setCount(gql.length);

      const raw = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd"
      );
      const res = await raw.clone().json();
      setFee(parseFloat((1 / res.arweave.usd).toFixed(4)));
    })();
  });

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  return (
    <Page>
      <Row justify="space-between" align="middle">
        <Breadcrumbs size="large">
          <Breadcrumbs.Item href="/">ArVerify</Breadcrumbs.Item>
          <Breadcrumbs.Item>Verify</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text
          onClick={() => {
            if (addr === "") {
              setVisible(true);
            } else {
              localStorage.removeItem("keyfile");
              setAddr("");
            }
          }}
          style={{cursor: "pointer"}}
        >
          {addr === "" ? "Log In" : addr}
        </Text>
      </Row>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        }}
      >
        {addr === "" ? (
          <Button type="secondary" onClick={() => setVisible(true)}>
            Log In
          </Button>
        ) : (
          <>
            <Text h4>Hi there,</Text>
            <Text><Code>{target}</Code> wants to get verified by you. If you know this address and are sure, that this address is not
              used for scamming or involved into malicious actions, click the Button to verify this address.
              This address has already been verified <Code>{count}</Code> time(s). The more verifications an address has,
              the higher will be the trust percentage of this address. Although verifications aren't the only factor for rating an address.
              By verifying this address, you help our ecosystem to stay scam free and having a trusted user-base.
            </Text>
            <Card>
              <Text h3>{target}</Text>
              <Text h4>{count} verifications</Text>
              <Button
                type="secondary"
                loading={loading}
                disabled={verified || addr === target}
                onClick={async () => {
                  setLoading(true);

                  const jwk = JSON.parse(localStorage.getItem("keyfile"));

                  const tip = await client.createTransaction(
                    {
                      target: await selectTokenHolder(),
                      quantity: client.ar.arToWinston(fee.toString()),
                    },
                    jwk
                  );
                  tip.addTag("Application", "ArVerify");
                  tip.addTag("Action", "FEE_Verification");
                  tip.addTag("Address", target);
                  await client.transactions.sign(tip, jwk);
                  await client.transactions.post(tip);

                  const tx = await client.createTransaction(
                    {
                      target,
                      data: Math.random().toString().slice(-4),
                    },
                    jwk
                  );
                  tx.addTag("Application", "ArVerify");
                  tx.addTag("Action", "Verification");
                  tx.addTag("Method", "Link");
                  tx.addTag("Address", target);
                  await client.transactions.sign(tx, jwk);
                  await client.transactions.post(tx);

                  setLoading(false);
                  setVerified(true);
                }}
              >
                {verified ? "Verified" : "Verify now"}
              </Button>
              <Card.Footer>
                <Text>
                  Fee: <Code>{fee} AR</Code> ~ <Code>$1.00</Code>
                </Text>
                <Tooltip text={'By taking a fee we disincentive, that networks of fake addresses get created.'}>Why do I have to pay fee?</Tooltip>
              </Card.Footer>
            </Card>
          </>
        )}
      </div>
      <Modal {...bindings}>
        <Modal.Title>Sign In</Modal.Title>
        <Modal.Subtitle style={{textTransform: "none"}}>
          Use your{" "}
          <a
            href="https://www.arweave.org/wallet"
            target="_blank"
            rel="noopener noreferrer"
          >
            Arweave keyfile
          </a>{" "}
          to continue
        </Modal.Subtitle>
        <Modal.Content>
          <Card
            style={{border: "1px dashed #333", cursor: "pointer"}}
            onClick={() => document.getElementById("file").click()}
          >
            <FileIcon size={24}/> Upload your keyfile
          </Card>
        </Modal.Content>
        <Modal.Action passive onClick={() => setVisible(false)}>
          Cancel
        </Modal.Action>
      </Modal>
      <input
        type="file"
        id="file"
        accept=".json,application/json"
        onChange={(ev) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const jwk = JSON.parse(reader.result.toString());
            const addr = await client.wallets.jwkToAddress(jwk);

            localStorage.setItem("keyfile", JSON.stringify(jwk));
            setAddr(addr);
            setVisible(false);
          };
          reader.readAsText(ev.target.files[0]);
        }}
      />
      <style jsx>{`
        #file {
          opacity: 0;
        }
      `}</style>
    </Page>
  );
};

export default Verify;
