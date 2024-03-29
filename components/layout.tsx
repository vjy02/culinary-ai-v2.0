import Header from "./header";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="generator-background">
      <div className="md:flex md:flex-col md:justify-center md:w-[85vw] lg:m-auto">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
