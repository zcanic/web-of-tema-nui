import { motion } from 'framer-motion';

const features = [
  {
    title: 'Customizable API',
    description: 'Configure your own API endpoint and model settings for maximum flexibility.',
    icon: '⚙️',
  },
  {
    title: 'Local Storage',
    description: 'Your conversations and settings are securely stored in your browser.',
    icon: '💾',
  },
  {
    title: 'Real-time Responses',
    description: 'Get instant, accurate responses with our optimized API integration.',
    icon: '⚡',
  },
  {
    title: 'Beautiful Interface',
    description: 'Enjoy a modern, clay-inspired design with smooth animations.',
    icon: '🎨',
  },
  {
    title: 'Code Highlighting',
    description: 'Code snippets are beautifully formatted with syntax highlighting.',
    icon: '💻',
  },
  {
    title: 'Cross-platform',
    description: 'Works seamlessly on desktop, tablet, and mobile devices.',
    icon: '📱',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-clay-800 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-clay-600 max-w-2xl mx-auto">
            Everything you need to have productive conversations with AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="clay-card"
            >
              <div className="flex items-start space-x-4">
                <motion.div
                  className="text-4xl"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {feature.icon}
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-clay-800 mb-2">{feature.title}</h3>
                  <p className="text-clay-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 