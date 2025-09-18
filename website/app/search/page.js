"use client";

import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-center py-5">Loading search results...</p>}>
      <SearchPageContent />
    </Suspense>
  );
}
