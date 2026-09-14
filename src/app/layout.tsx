import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horario Inteligente UTP • Copiloto de Clases & Exámenes",
  description: "Visualizador de horarios universitarios, enlaces directos a Zoom, descarga de sílabos oficiales y Asistente IA estilo Claude para preparación de clases y exámenes de la UTP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#0d0d10] text-[#f3f3f6] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
