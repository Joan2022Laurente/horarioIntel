import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Horario Inteligente UTP • Copiloto de Clases & Exámenes",
  description: "Visualizador de horarios universitarios, enlaces directos a Zoom, descarga de sílabos oficiales y Asistente IA para preparación de clases y exámenes de la UTP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-[#0a0a0c] text-[#f3f3f6] antialiased tracking-[-0.015em]`}
      >
        {children}
      </body>
    </html>
  );
}
