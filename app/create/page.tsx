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

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] px-4 py-10">
      <div className="w-full max-w-4xl mx-auto">
        <CreateClient fid={fid} originHolder={originHolder} />
      </div>
    </main>
  );
}