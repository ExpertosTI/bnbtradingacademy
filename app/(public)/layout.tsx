import { PlatformScene } from "@/components/platform-scene";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <div className="pointer-events-none fixed inset-0">
        <PlatformScene />
      </div>
      <PublicHeader user={user} />
      {children}
      <PublicFooter />
    </>
  );
}
