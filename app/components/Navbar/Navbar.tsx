"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/Projects" },
  { label: "Docs", href: "/Docs" },
  { label: "Blogs", href: "/Blogs" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Request", href: "/Request" },
  { label: "Our Designers", href: "/WebDesigners" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy Policy", href: "/policy" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <Link href="/" className={styles.brand} aria-label="Home">
        <Image src="/lgog.png" alt="Logo" width={80} height={80} className={styles.logo} />
      </Link>

      <nav className={styles.links} aria-label="Primary">
        {LINKS.map(({ label, href }) => (
          <Link key={label} href={href} className={styles.link}>
            {label}
          </Link>
        ))}
      </nav>

      <Link href="/Request" className={styles.cta}>
        Let&apos;s Talk
      </Link>
    </header>
  );
}
