import Navbar from "@/components/navbar";
import LandingPage from "@/components/landingPage";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col">
        <LandingPage />
      </main>
      <Footer />
    </>
  );
}
