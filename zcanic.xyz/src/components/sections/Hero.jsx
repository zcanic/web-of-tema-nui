import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-clay-800">
              Your Intelligent{' '}
              <span className="text-clay-500 clay-morph inline-block">AI Assistant</span>
            </h1>
            <p className="text-xl text-clay-600">
              Experience the power of AI with our intuitive chat interface. Get instant answers,
              creative ideas, and expert assistance for any task.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#chat">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="clay-button text-lg"
                >
                  Start Chatting
                </motion.button>
              </Link>
              <Link href="#features">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="clay-button text-lg bg-transparent border-2 border-clay-300"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="clay-card clay-morph p-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-clay-300" />
                  <div className="h-4 w-32 rounded-full bg-clay-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-full bg-clay-200" />
                  <div className="h-4 w-3/4 rounded-full bg-clay-200" />
                </div>
                <div className="flex justify-end">
                  <div className="h-4 w-24 rounded-full bg-clay-300" />
                </div>
              </div>
            </div>

            <motion.div
              className="absolute -top-8 -right-8 clay-card clay-morph p-4"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="h-8 w-8 rounded-full bg-clay-300" />
            </motion.div>

            <motion.div
              className="absolute -bottom-8 -left-8 clay-card clay-morph p-4"
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <div className="h-8 w-8 rounded-full bg-clay-300" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 