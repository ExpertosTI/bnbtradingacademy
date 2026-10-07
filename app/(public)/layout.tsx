import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <PublicHeader user={user} />
      {children}
      <PublicFooter />
    </>
  );
}
