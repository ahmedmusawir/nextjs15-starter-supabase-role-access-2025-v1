import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import { protectPage } from "@/utils/supabase/actions";
import { AppRole } from "@/utils/get-user-role";

interface LayoutProps {
  children: ReactNode;
}

export default async function SuperAdminLayout({ children }: LayoutProps) {
  await protectPage([AppRole.SUPERADMIN]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <div className="flex-1 p-5 md:max-w-[1140px]">{children}</div>
      </div>
    </div>
  );
}
