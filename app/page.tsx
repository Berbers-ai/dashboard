import DashboardClient from "./DashboardClient";

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/news", { cache: "no-store" });
  const data = await res.json();

  return <DashboardClient data={data} />;
}
