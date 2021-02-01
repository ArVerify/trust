import { GeistProvider, CssBaseline } from "@geist-ui/react";
import Head from "next/head";

function App({ Component, pageProps }) {
  let theme = "light";
  if (typeof window === `undefined`) return "light";
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    theme = "dark";
  }

  return (
    <GeistProvider
      theme={{
        type: theme,
      }}
    >
      <CssBaseline />
      <Head>
        <title>ArVerify - Trust</title>
      </Head>
      <Component {...pageProps} />
    </GeistProvider>
  );
}

export default App;
