// app/create/page.tsx
import CreateClient from "./CreateClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "edge";

interface CreatePageProps {
  searchParams?: {
    fid?: string;
    originHolder?: string;
  };
}

export default function CreatePage({ searchParams }: CreatePageProps) {
  const fid = searchParams?.fid ?? null;
  const originHolder = searchParams?.originHolder === "1";

  return <CreateClient fid={fid} originHolder={originHolder} />;
}
