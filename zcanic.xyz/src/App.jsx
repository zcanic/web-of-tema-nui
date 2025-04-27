import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
// import Home from './components/Home'; // Removed
// import About from './components/About'; // Removed
// import Contact from './components/Contact'; // Removed
import ChatInterface from './components/ChatInterface';
import BlogPage from './pages/Blog';
import NewPostForm from './pages/NewPost';
import Footer from './components/Footer';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          {/* 将 main 区域直接用于 ChatInterface，或根据需要调整 */}
          {/* 如果希望保留容器样式，可以这样写: */}
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex"> {/* 添加 flex 使子元素可填充 */}
             {/* 让 ChatInterface 填充 main 区域 */}
            <ErrorBoundary>
              <div className="flex-1">
                 <Routes>
                   {/* 可以设置默认路由到 /chat */}
                   <Route path="/" element={<ChatInterface />} /> 
                   {/* <Route path="/about" element={<About />} /> // Removed */}
                   {/* <Route path="/contact" element={<Contact />} /> // Removed */}
                   <Route path="/chat" element={<ChatInterface />} />
                   <Route path="/blog" element={<BlogPage />} />
                   <Route path="/blog/new" element={<NewPostForm />} />
                 </Routes>
              </div>
            </ErrorBoundary>
          </main>
          {/* 或者如果 ChatInterface 应该占满 Navbar 和 Footer 之间的所有空间: */}
          {/* <main className="flex-1 flex">
            <Routes>
              <Route path="/" element={<ChatInterface />} />
              <Route path="/chat" element={<ChatInterface />} />
            </Routes>
          </main> */}
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App; 