'use client'
// src/app/search/page.tsx
import { Suspense } from 'react'
import SearchPage from '@/components/search/SearchPage'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function Search() {
  return (
    <>
      <Navbar lang="fr" />
      <Suspense fallback={<div className="min-h-screen" />}>
        <SearchPage />
      </Suspense>
      <Footer lang="fr" />
    </>
  )
}
