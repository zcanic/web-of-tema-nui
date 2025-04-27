import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-clay-100 py-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div>
            <h3 className="text-xl font-bold text-clay-800 mb-4">AI Chatbox</h3>
            <p className="text-clay-600">
              Your intelligent AI assistant powered by OpenAI. Experience the future of conversation.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-clay-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-clay-600 hover:text-clay-800 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#chat" className="text-clay-600 hover:text-clay-800 transition-colors">
                  Chat
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-clay-800 mb-4">Contact</h3>
            <p className="text-clay-600">
              Have questions or suggestions? We'd love to hear from you.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-clay-200 text-center text-clay-600"
        >
          <p>&copy; {new Date().getFullYear()} AI Chatbox. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
} 