import dynamic from "next/dynamic";
import { Header } from "../components/Layout";

const DataLineageGraph = dynamic(() => import("../components/Graph"), {
  ssr: false,
});

function App() {
  return (
    <div className="container">
      <Header />
      <DataLineageGraph />
    </div>
  );
}

export default App;
