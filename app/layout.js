'use client'; // Required for AnimatePresence and motion components at the root
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({ children }) {
    const pathname = usePathname();

    return (
        <html
            foxified=""
            webcrx=""
        >
            <AuthProvider>
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname} // Keyed to trigger animation on route change
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }} // Ensure motion.div behaves like body
                        >
                            {/*
                              Since children might be server components, and motion.div needs to be a direct child for AnimatePresence,
                              if you have specific layouts that are client components, you might move AnimatePresence there.
                              For a general fade-in/out, this structure is a common starting point.
                            */}
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </body>
            </AuthProvider>
        </html>
    );
}
