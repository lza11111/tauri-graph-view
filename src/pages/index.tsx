import dynamic from "next/dynamic";
import Router from "next/router";
import { useEffect } from "react";
import { Header, Layout } from "../components/Layout";

const DataLineageGraph = dynamic(() => import("../components/Graph"), {
  ssr: false,
});

function App() {
  useEffect(() => {
    Router.push("/data-assets")
  }, []);

  return (
    <Layout>
      <div>Home</div>
    </Layout>
  );
}

export default App;
