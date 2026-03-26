"use client";

import React from "react";
import { MapperCard } from "./components/mapper-card";
import { TypMapperCard } from "./components/typ-mapper";


export default function HomePage() {

  return (
    <main className="min-h-screen container p-4 2xl:flex gap-4">
      <MapperCard />

      <TypMapperCard/>
    </main >
  );
}
