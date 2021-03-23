import Arweave from "arweave";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import {
  useModal,
  Page,
  Row,
  Text,
  Button,
  Modal,
  Card,
  Code,
  Divider,
  Tooltip,
  Spacer,
  Link,
  Note,
} from "@geist-ui/react";
import { all, run } from "ar-gql";
import verificationsQuery from "../../queries/verifications";
import verificationQuery from "../../queries/verification";
import { FileIcon, InfoIcon } from "@primer/octicons-react";
import { selectTokenHolder } from "../../utils/community";
import { COMMUNITY as COMMUNITY_ID } from "arverify";
import NextLink from "next/link";
import homeStyles from "../../styles/home.module.sass";

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

  const { setVisible, bindings } = useModal();
  const {
    setVisible: setConfirmationVisible,
    bindings: confirmationBindings,
  } = useModal();

  const [count, setCount] = useState(0);
  const [fee, setFee] = useState(0);

  // todo get from community vote
  const FEE = 0.05;

  useEffect(() => {
    (async () => {
      const gql = await all(verificationsQuery, { addr: target });
      setCount(gql.length);

      const raw = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd"
      );
      const res = await raw.clone().json();
      setFee(Math.max(FEE, parseFloat((0.5 / res.arweave.usd).toFixed(4))));
    })();
  });

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (addr && target) {
      (async () => {
        const gql = (await run(verificationQuery, { addr, target })).data
          .transactions.edges;
        if (gql.length === 1) {
          setVerified(true);
        }

        setBalance(
          parseFloat(
            client.ar.winstonToAr(await client.wallets.getBalance(addr))
          )
        );
      })();
    }
  }, [addr, target]);

  const [tweetDisabled, setTweetDisabled] = useState(false);

  return (
    <Page>
      <Row justify="space-between" align="middle">
        <NextLink href="/">
          <a className={homeStyles.logo}>
            <img src="/logo-text.svg" alt="ArVerify" />
          </a>
        </NextLink>
        <Tooltip
          text={
            <p style={{ margin: 0, textAlign: "center" }}>
              Click here to {addr === "" ? "login" : "logout"}
            </p>
          }
          placement="bottom"
        >
          <Text
            onClick={() => {
              if (addr === "") {
                setVisible(true);
              } else {
                localStorage.removeItem("keyfile");
                setAddr("");
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {addr === "" ? "Log In" : "Logout"}
          </Text>
        </Tooltip>
      </Row>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        }}
      >
        <Text h3>Hi there,</Text>
        <Text>
          <Code>{target}</Code> wants to be verified by you on ArVerify.
        </Text>
        <Text>
          ArVerify is a trust score for the permaweb which is often used by
          developers to ensure that their users are trustworthy humans, and not
          bots. Do you know this user?
        </Text>
        <Text>
          If so, hit the button below to help them raise their trust score on
          the decentralised web!
        </Text>
        <Divider />
        <Text h4>{count} verification(s)</Text>
        {addr === "" ? (
          <Button
            type="success-light"
            onClick={() => setVisible(true)}
            className="arverify-button"
          >
            Sign in with your key file
          </Button>
        ) : (
          <>
            <Button
              type="success-light"
              loading={loading || fee === 0}
              disabled={verified || addr === target || balance <= fee}
              onClick={async () => {
                setConfirmationVisible(true);
              }}
              className="arverify-button"
            >
              {verified
                ? "Verified"
                : balance <= fee
                ? "Insufficient funds"
                : "Verify now"}
            </Button>
            {verified && (
              <>
                <Spacer y={0.5} />
                <Button
                  type="success-light"
                  className="arverify-button"
                  disabled={tweetDisabled}
                  onClick={async () => {
                    const raw = await fetch(
                      `https://api.arverify.org/tweet/${target}`
                    );
                    const res = await raw.json();

                    if (res.meta.result_count === 0) {
                      setTweetDisabled(true);
                    } else {
                      const tweet = res.meta.oldest_id;
                      router.push(
                        "https://twitter.com/intent/tweet?text=" +
                          encodeURIComponent(
                            `Hey! Just verified you! Mind verifying me?\nhttps://${window.location.host}/verify/${addr} 🙌🏻☑️`
                          ) +
                          `&in_reply_to=${tweet}`
                      );
                    }
                  }}
                >
                  {tweetDisabled ? "Unable to find tweet" : "Tweet about this"}
                </Button>
              </>
            )}
          </>
        )}
        <Text>
          Fee: <Code>{fee} AR</Code>{" "}
          <Tooltip text="By taking a fee, we disincentivize the creation of fake address networks.">
            <InfoIcon />
          </Tooltip>
        </Text>
        <Spacer y={-1.5} />
        <Text>
          Reward: <Code>ARVERIFY profit sharing tokens.</Code>{" "}
          <Tooltip text="Each day we distribute part of the ownership of the ArVerify protocol to its users, proportionately to the number of people they verify. This ownership entitles you to future profits from the platform, as well as a say in governance decisions.">
            <InfoIcon />
          </Tooltip>
        </Text>
      </div>
      <Modal {...bindings}>
        <Modal.Title>Sign In</Modal.Title>
        <Modal.Subtitle style={{ textTransform: "none" }}>
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
            style={{ border: "1px dashed #333", cursor: "pointer" }}
            onClick={() => document.getElementById("file").click()}
          >
            <FileIcon size={24} /> Sign in with your keyfile
          </Card>
          <Spacer y={1} />
          <Note>Your keyfile will stay locally.</Note>
        </Modal.Content>
        <Modal.Action passive onClick={() => setVisible(false)}>
          Cancel
        </Modal.Action>
      </Modal>

      <Modal {...confirmationBindings}>
        <Modal.Title>Confirm your verification</Modal.Title>
        <Modal.Content>
          <Text>
            The fee will be sent to the{" "}
            <Link
              color
              target="_blank"
              href="https://community.xyz/#f6lW-sKxsc340p8eBBL2i_fnmSI_fRSFmkqvzqyUsRs"
            >
              ArVerify Community
            </Link>
            .
          </Text>
        </Modal.Content>
        <Modal.Action passive onClick={() => setConfirmationVisible(false)}>
          Cancel
        </Modal.Action>
        <Modal.Action
          type={"success"}
          loading={loading}
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

            // community xyz activity tags
            tx.addTag("Service", "ArVerify");
            tx.addTag("Community-ID", COMMUNITY_ID);
            tx.addTag(
              "Message",
              `Verified ${target} through their sharable link`
            );
            tx.addTag("Type", "ArweaveActivity");

            await client.transactions.sign(tx, jwk);
            await client.transactions.post(tx);

            setLoading(false);
            setVerified(true);

            router.reload();

            setVisible(false);
          }}
        >
          Confirm
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
