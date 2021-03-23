import Arweave from "arweave";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { all } from "ar-gql";
import verificationsQuery from "../queries/verifications";
import addressVerifiedQuery from "../queries/addressVerified";
import {
  Button,
  Card,
  Code,
  Col,
  Link,
  Loading,
  Modal,
  Note,
  Page,
  Progress,
  Row,
  Spacer,
  Text,
  Tooltip,
  useClipboard,
  useModal,
  useTheme,
  useToasts,
} from "@geist-ui/react";
import {
  ClippyIcon,
  ClockIcon,
  FileIcon,
  KeyIcon,
  ShareIcon,
} from "@primer/octicons-react";

import { getVerification } from "arverify";
import styles from "../styles/home.module.sass";
import GoogleSignInButton from "../components/authnode/GoogleSignInButton";
import TwitterButton from "../components/twitterButton";
import useArConnect from "use-arconnect";

const arConnectPermissions = [
  "ACCESS_ADDRESS",
  "ACCESS_ALL_ADDRESSES",
  "SIGN_TRANSACTION",
];

const Home = () => {
  const theme = useTheme();
  const [addr, setAddr] = useState("");
  const arConnect = useArConnect();

  useEffect(() => {
    if (!arConnect) return;
    (async () => {
      try {
        if ((await arConnect.getPermissions()).includes("ACCESS_ADDRESS")) {
          setAddr(await arConnect.getActiveAddress());
        }
      } catch {}
    })();
  }, [arConnect]);

  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState("warning");
  const [percentage, setPercentage] = useState(0);
  const [score, setScore] = useState(0);

  const [verified, setVerified] = useState(false);

  const [time, setTime] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [count, setCount] = useState(0);
  const [addressHasVerified, setAddressHasVerified] = useState<string[]>();

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

      const verification = await getVerification(addr);
      console.log(verification);
      setVerified(!!verification.txID);

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
      })();
    }
  }, [addr, failed]);

  const [, setToast] = useToasts();
  const { copy } = useClipboard();

  const connectWallet = async () => {
    if (!arConnect) return window.open("https://arconnect.io");
    // logout
    if (addr !== "") {
      await arConnect.disconnect();
      setAddr("");
    } else {
      // login
      try {
        await arConnect.connect(arConnectPermissions);
        setAddr(await arConnect.getActiveAddress());
        window.addEventListener("walletSwitch", (e: any) =>
          setAddr(e.detail.address)
        );
      } catch {
        setToast({ text: "Could not connect to ArConnect", type: "error" });
      }
    }
  };

  return (
    <Page>
      <Row justify="space-between" align="middle">
        <a href="https://arverify.org" className={styles.logo}>
          <img src="/logo-text.svg" alt="ArVerify" />
        </a>
        <Tooltip
          text={
            <p style={{ margin: 0, textAlign: "center" }}>
              Click here to {addr === "" ? "login" : "logout"}
            </p>
          }
          placement="bottom"
        >
          <Text onClick={connectWallet} style={{ cursor: "pointer" }}>
            {(arConnect && (addr === "" ? "Log In" : "Logout")) ||
              "Install ArConnect"}
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
              The next web will be defined by{" "}
              <b
                style={{
                  color: theme.palette.success,
                  fontWeight: 800,
                  fontSize: "1.2em",
                }}
              >
                trust
              </b>
              .
            </Text>
            <Text h3>
              ArVerify is your portal to verification on every app, anywhere on
              the permaweb.
            </Text>
            <Text h3>Jump in now.</Text>
            <Spacer y={4} />
            <Button
              type="success-light"
              onClick={connectWallet}
              className="arverify-button"
            >
              <KeyIcon />
              {(arConnect && "Connect to your wallet") || "Install ArConnect"}
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
                  type="success-light"
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
                  className="arverify-button"
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
                <Tooltip text="Click to copy" placement="bottom">
                  <h1
                    className={styles.address}
                    onClick={() => {
                      copy(addr);
                      setToast({ text: "Address copied to clipboard" });
                    }}
                  >
                    {addr}
                  </h1>
                </Tooltip>
                <Spacer y={2} />
                <Row justify={"space-around"}>
                  <Col>
                    <Text h3>Your current trust-score is {percentage}%</Text>
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
                        <Tooltip
                          text={`Last updated at: ${timestamp}`}
                          placement="bottom"
                        >
                          <Text className={styles.updatedAt}>
                            <ClockIcon /> Updated {time}
                          </Text>
                        </Tooltip>
                      </Card>
                    </Row>
                  </Col>
                </Row>

                <Spacer y={2} />

                <Row>
                  <Col>
                    <Text h3>Boost your score</Text>
                    <Text>
                      To increase your score, simply ask a friend to verify you
                      by sending them this link:
                      <a
                        href={`https://${window.location.host}/verify/${addr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "block" }}
                      >
                        https://{window.location.host}/verify/{addr}
                      </a>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Text
                          className={styles.CopyLink}
                          onClick={() => {
                            copy(
                              `https://${window.location.host}/verify/${addr}`
                            );
                            setToast({ text: "Copied verification link" });
                          }}
                        >
                          <ClippyIcon />
                          Copy verification link
                        </Text>
                        {navigator.share && (
                          <Text
                            className={styles.CopyLink}
                            style={{ marginLeft: "1em" }}
                            onClick={() =>
                              navigator.share({
                                title: `Verify ${addr} on ArVerify`,
                                url: `https://${window.location.host}/verify/${addr}`,
                              })
                            }
                          >
                            <ShareIcon />
                            Share link
                          </Text>
                        )}
                      </div>
                    </Text>
                    <TwitterButton {...{ addr }} />
                    <Spacer y={1.6} />
                    <Text>
                      You can also purchase third-party verification from
                      Google:
                    </Text>
                    <GoogleSignInButton {...{ verified, addr }} />
                  </Col>
                </Row>

                <Spacer y={2} />
                <Row>
                  <Col>
                    <Text h3>You have verified:</Text>
                    <Text className={styles.VerifiedAddresses}>
                      {(addressHasVerified &&
                        ((addressHasVerified.length === 0 && (
                          <Text>You have not verified anyone.</Text>
                        )) ||
                          addressHasVerified.map((address, i) => (
                            <div key={i}>
                              <Code>{address}</Code>
                              <Spacer y={0} />
                            </div>
                          )))) || <Loading />}
                    </Text>
                  </Col>
                </Row>
              </div>
            )}
          </>
        )}
      </>
    </Page>
  );
};

export default Home;
