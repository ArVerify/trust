import { GeistProvider, CssBaseline } from "@geist-ui/react";
import Head from "next/head";
import "../styles/global.sass";

const theme = {
  palette: {
    code: "#499bcd",
    success: "#499bcd",
    link: "#499bcd",
    selection: "#499bcd",
  },
};

function App({ Component, pageProps }) {
  return (
    <GeistProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>ArVerify - Trust</title>
      </Head>
      <Component {...pageProps} />
    </GeistProvider>
  );
}

export default App;
