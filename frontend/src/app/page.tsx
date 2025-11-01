import { ServiceList } from "@/components/ServiceList";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ServiceList />
      </main>
    </>
  );
}
