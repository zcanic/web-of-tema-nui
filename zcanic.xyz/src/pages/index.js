import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Chatbox from '../components/sections/Chatbox';
import Footer from '../components/layout/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          className="h-16 w-16 rounded-full bg-clay-300"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AI Chatbox - Your Intelligent Assistant</title>
        <meta name="description" content="An intelligent AI assistant powered by OpenAI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-clay-50"
      >
        <Header />
        <Hero />
        <Features />
        <Chatbox />
        <Footer />
      </motion.main>
    </>
  );
} 