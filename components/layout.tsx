import Header from "./header"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="lg:flex lg:flex-col lg:justify-center lg:w-[80vw] lg:m-auto">
        <Header />
        <main>{children}</main>
    </div>
  )
}
