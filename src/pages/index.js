import { isAuthenticated } from "@/utils/auth";

export default function Home() {
  return null;
}

export async function getServerSideProps({ req }) {
  if (isAuthenticated(req)) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }
  return { redirect: { destination: "/login", permanent: false } };
}
