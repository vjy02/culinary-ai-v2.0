import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./header.module.css";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import logoIcon from "../public/images/logo.png";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();
  const currentRoute = usePathname();

  useEffect(() => {
    if (status === "loading") return; // Add this line to wait until the session is loaded

    if (session && router.pathname === "/") {
      router.push("/generator");
    } else if (!session && router.pathname !== "/login") {
      router.push("/");
    }
  }, [session, status]); // Add status as a dependency

  function redirectLogin() {
    router.push("/login");
  }

  return (
    <header>
      <div className="w-[85%] md:w-[95%] flex justify-between items-center mt-[2em] mb-[2em] mr-auto ml-auto">
        <div className="w-[30vw]">
          {session && session.user && session.user.image ? (
            <Image src={session.user.image} height={50} width={50} alt="logo" />
          ) : (
            <Image src={logoIcon} height={145} width={145} alt="logo" />
          )}
        </div>
        <div>
          {!session && (
            <>
              <a
                className="self-start pt-2 pb-2 pr-4 pl-4 md:pt-3 md:pb-3 md:pr-5 md:pl-5 rounded-lg bg-green-500 text-white font-bold cursor-pointer"
                onClick={redirectLogin}
              >
                Sign in
              </a>
            </>
          )}
          {session?.user && (
            <>
              <a
                href={`/api/auth/signout`}
                className="self-start pt-2 pb-2 pr-4 pl-4 md:pt-3 md:pb-3 md:pr-5 md:pl-5 rounded-lg bg-green-500 text-white font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  signOut();
                }}
              >
                Sign out
              </a>
            </>
          )}
      </div>
      </div>
      <nav>
        {session?.user && (
          <ul className="p-0 list-none w-[85%] md:w-[95%] mt-[2em] mb-[2em] mr-auto ml-auto">
            <li className="inline-block mr-[1rem]">
              <Link
                href="/generator"
                className={
                  currentRoute === "/generator"
                    ? "underline underline-offset-4 decoration-2"
                    : ""
                }
              >
                Generator
              </Link>
            </li>
            <li className="inline-block mr-[1rem]">
              <Link
                href="/user-recipes"
                className={
                  currentRoute === "/user-recipes"
                    ? "underline underline-offset-4 decoration-2"
                    : ""
                }
              >
                My Recipes
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
