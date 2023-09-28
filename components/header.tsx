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
    if (session && router.pathname === "/") {
      router.push("/generator");
    } else if (!session && router.pathname !== "/" && router.pathname !== "/login") {
      router.push("/");
    }
  }, [session]);

  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.loginHeader}>
        {session && session.user && session.user.image ? (
          <Image src={session.user.image} height={50} width={50} alt="logo" />
        ) : (
          <Image src={logoIcon} height={145} width={145} alt="logo" />
        )}

        <p
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {!session && (
            <>
              <a
                href={`/api/auth/signin`}
                className="self-start pt-2.5 pb-2.5 pr-4 pl-4 rounded-lg bg-green-500 text-white font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  signIn('google');
                }}
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
        </p>
      </div>
      <nav>
        {session?.user && (
          <ul className={styles.navItems}>
            <li className={styles.navItem}>
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
            <li className={styles.navItem}>
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
