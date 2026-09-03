import Header from "@/components/Header";
import SimulatorForm from "@/components/SimulatorForm";
import HistoryChart from "@/components/HistoryChart";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gris-suave/40">
      <Header />
      <SimulatorForm />
      <HistoryChart />
      <Footer />
    </main>
  );
}
