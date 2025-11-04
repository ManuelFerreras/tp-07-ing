"use client";

import Link from 'next/link';

export default function HomePage() {

  return (
    <div>
      <h2>Home</h2>

      <Link href="/employees">Employees</Link>

    </div>
  );
}


