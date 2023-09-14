import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Image from 'next/image'
import logoIcon from "../public/images/logo.svg"

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const router = useRouter()

  useEffect(() => {
    if (session && router.pathname === "/"){
      router.push("/generator")
    }
    else if (!session && router.pathname !== "/"){
      router.push("/")
    }
  }, [session])

  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.loginHeader}>
        {(session && session.user && session.user.image) ? (
          <Image
              src={session.user.image}
              height={50}
              width={50}
              alt="logo"
          />
        ) :
        (
          <Image
          src={logoIcon}
          height={50}
          width={50}
          alt="logo"
           />
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
                className={styles.buttonPrimary}
                onClick={(e) => {
                  e.preventDefault()
                  signIn()
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
                className={styles.button}
                onClick={(e) => {
                  e.preventDefault()
                  signOut()
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
              <Link href="/generator">Generator</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/user-recipes">My Recipes</Link>
            </li>
          </ul>
          )}
      </nav>
    </header>
  )
}
