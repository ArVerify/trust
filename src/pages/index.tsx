import Arweave from "arweave";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { all } from "ar-gql";
import verificationsQuery from "../queries/verifications";
import addressVerifiedQuery from "../queries/addressVerified";
import {
  useModal,
  useToasts,
  useClipboard,
  Page,
  Row,
  Breadcrumbs,
  Text,
  Button,
  Card,
  Spacer,
  Modal,
  Col,
  Progress,
  useTheme,
  Tooltip,
  Code,
  Link,
} from "@geist-ui/react";
import {
  FileIcon,
  ClippyIcon,
  ClockIcon,
  ShareAndroidIcon,
} from "@primer/octicons-react";
import { URLSearchParams } from "url";

const client = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const Home = () => {
  const theme = useTheme();
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

  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState("warning");
  const [percentage, setPercentage] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [count, setCount] = useState(0);
  const [addressHasVerified, setAddressHasVerified] = useState([]);

  const fetchData = async () => {
    moment.locale(navigator.language);
    const raw = await fetch(`https://api.arverify.org/score/${addr}`);
    const res = await raw.clone().json();

    const status = res.status;

    if (status === "FETCHED") {
      setFailed(false);
      setStatus("success");

      setPercentage(parseFloat(res.percentage.toFixed(2)));
      setScore(res.score);

      const now = moment();
      const then = moment.utc(res.updated_at);
      const diff = moment.duration(-now.diff(then));
      setTime(diff.humanize(true));
      setTimestamp(moment.utc(res.updated_at).local().format("L LTS"));

      const gql = await all(verificationsQuery, { addr });
      setCount(gql.length);

      const result = await all(addressVerifiedQuery, { addr });
      setAddressHasVerified(
        result.map((r) => {
          return r.node.recipient;
        })
      );
    }
    if (status === "SUBMITTED") {
      setStatus("warning");
    }
    if (status === "UNKNOWN") {
      setFailed(true);
    }
  };

  useEffect(() => {
    if (addr !== "" && !failed) {
      (async () => {
        setLoading(true);
        await fetchData();
        setLoading(false);

        setInterval(async () => {
          await fetchData();
        }, 60000);
      })();
    }
  }, [addr, failed]);

  const [, setToast] = useToasts();
  const { copy } = useClipboard();

  return (
    <Page>
      <Row justify="space-between" align="middle">
        <Breadcrumbs size="large">
          <Breadcrumbs.Item href="https://arverify.org">
            ArVerify
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>Trust</Breadcrumbs.Item>
        </Breadcrumbs>
        <Tooltip
          text={`Click here to ${addr === "" ? "login" : "logout"}`}
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
            {addr === "" ? "Log In" : addr}
          </Text>
        </Tooltip>
      </Row>
      <>
        {addr === "" ? (
          <div
            style={{
              position: "absolute",
              top: "55%",
              left: "50%",
              transform: "translateX(-50%) translateY(-50%)",
            }}
          >
            <Text h3>
              The next web will be defined by <Code>trust</Code>.
            </Text>
            <Text h3>
              ArVerify is your portal to verification on every app, anywhere on
              the permaweb.
            </Text>
            <Text h3>Jump in now.</Text>
            <Spacer y={4} />
            <Button type="secondary" onClick={() => setVisible(true)}>
              Sign in with your key file
            </Button>
          </div>
        ) : (
          <>
            {failed ? (
              <div
                style={{
                  position: "absolute",
                  top: "55%",
                  left: "50%",
                  transform: "translateX(-50%) translateY(-50%)",
                }}
              >
                <Text h3>Hello!</Text>
                <Text>
                  Your address has not been indexed yet. Click the button below
                  to index your address, your score will be updated in the next
                  24 hours.
                </Text>
                <Button
                  type="secondary"
                  onClick={async () => {
                    await fetch(`https://api.arverify.org/score`, {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ address: addr }),
                    });
                    setFailed(false);
                  }}
                >
                  Submit your address
                </Button>
              </div>
            ) : (
              <div
                style={{
                  margin: "0 auto",
                  width: "80%",
                }}
              >
                <Spacer y={2} />
                <Row justify={"space-around"}>
                  <Col>
                    <Text h3>Welcome!</Text>
                    <Text h4>Your current trust-score is {percentage}%</Text>
                    <Text>
                      Many applications on the{" "}
                      <Link target="_blank" href="https://arweave.org" color>
                        permaweb
                      </Link>{" "}
                      use ArVerify to ensure that only trustworthy, human user's
                      posts are shown. By obtaining a healthy verification
                      score, you can ensure that you are trusted by applications
                      on the permaweb.{" "}
                    </Text>
                    <Text>
                      To increase your score simply ask a friend to verify you,
                      or purchase a third-party verification.
                    </Text>
                  </Col>
                  <Col>
                    <Row justify={"space-around"}>
                      <Card width="80%">
                        <Text h2 style={{ textAlign: "center" }}>
                          {`${percentage}%`}
                        </Text>
                        <Progress
                          value={percentage}
                          colors={{
                            30: theme.palette.error,
                            80: theme.palette.warning,
                            100: theme.palette.success,
                          }}
                        />
                        <Spacer y={1} />
                        <Text h4>You have {count} verification(s)</Text>
                        <Card.Footer>
                          <Text>
                            <Text
                              onClick={() => {
                                copy(
                                  `https://${window.location.host}/verify/${addr}`
                                );
                                setToast({
                                  text:
                                    "Verification link copied to clipboard.",
                                  type: "secondary",
                                });
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <ClippyIcon /> Copy verification link.
                            </Text>
                            <Text>
                              <ShareAndroidIcon />
                              <Link
                                target="_blank"
                                className="twitter-share-button"
                                href={
                                  "https://twitter.com/intent/tweet?text=" +
                                  encodeURIComponent(
                                    `Hello everyone!\nPlease verify my Arweave address by using ArVerify here: https://${window.location.host}/verify/${addr}`
                                  )
                                }
                              >
                                Tweet verification link.
                              </Link>
                            </Text>
                            <Spacer y={0.5} />
                            <Tooltip
                              text={`Last updated at: ${timestamp}`}
                              placement="bottom"
                            >
                              <ClockIcon /> {time}
                            </Tooltip>
                          </Text>
                        </Card.Footer>
                      </Card>
                    </Row>
                  </Col>
                </Row>

                <Spacer y={2} />
                <Row>
                  <Col>
                    <Text h4>You have verified:</Text>
                    <Text>
                      {addressHasVerified.length === 0 && (
                        <Text>You have not verified anyone.</Text>
                      )}
                      {addressHasVerified.map((address) => {
                        return (
                          <>
                            <Code>{address}</Code>
                            <Spacer y={0} />
                          </>
                        );
                      })}
                    </Text>
                  </Col>
                </Row>
              </div>
            )}
          </>
        )}
      </>
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
            <FileIcon size={24} /> Upload your keyfile
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

export default Home;
