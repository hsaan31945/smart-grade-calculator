import type { Metadata } from "next"; import { Geist,Geist_Mono } from "next/font/google"; import { Toaster } from "sonner"; import "./globals.css";
const geist=Geist({variable:"--font-geist-sans",subsets:["latin"]}); const mono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={title:{default:"Smart Grade Calculator",template:"%s · Smart Grade"},description:"University-specific relative grade, GPA and CGPA calculator by Vireonix."};
export const dynamic = "force-dynamic";
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`dark ${geist.variable} ${mono.variable}`}><body className="antialiased"><Toaster theme="dark" richColors/>{children}</body></html>}
