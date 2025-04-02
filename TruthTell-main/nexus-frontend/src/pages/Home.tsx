// import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { FaCheckCircle, FaBolt, FaDatabase, FaBrain } from "react-icons/fa";
import "./Home.css";
import Spline from '@splinetool/react-spline';
import Navbar from "@/components/navbar";

const Home = () => {
  const features = [
    {
      icon: <FaBolt className="text-4xl text-fuchsia-500" />,
      title: "Real-Time Detection",
      description: "Instant fact-checking during live broadcasts",
    },
    {
      icon: <FaBrain className="text-4xl text-fuchsia-500" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning for accurate verification",
    },
    {
      icon: <FaDatabase className="text-4xl text-fuchsia-500" />,
      title: "Knowledge Graph",
      description: "Comprehensive fact database with Neo4j",
    },
    {
      icon: <FaCheckCircle className="text-4xl text-fuchsia-500" />,
      title: "Truth Detection",
      description: "Sophisticated NLP for misinformation detection",
    },
  ];

  // return (
  //   <div className="min-h-screen retro-theme p-8">
  //     <motion.div
  //       className="text-center my-16"
  //       initial={{ opacity: 0, y: 20 }}
  //       animate={{ opacity: 1, y: 0 }}
  //       transition={{ duration: 0.8 }}
  //     >
  //       <h1 className="text-5xl md:text-8xl font-bold mb-4 glitch-text">
  //         NEXUS OF TRUTH
  //       </h1>
  //       <p className="text-xl md:text-2xl mb-8">
  //         Real-Time Misinformation Detection System
  //       </p>
  //       <Link to="/dashboard">
  //       <motion.button
  //         className="bg-fuchsia-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-fuchsia-700 transition-colors"
  //         whileHover={{ scale: 1.05 }}
  //         whileTap={{ scale: 0.95 }}
  //         >
  //         Get Started
  //       </motion.button>
  //       </Link>
  //     </motion.div>

  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-16">
  //       {features.map((feature, index) => (
  //         <motion.div
  //           key={index}
  //           className="p-6 rounded-xl border border-[#00ff41] bg-opacity-5 bg-white backdrop-blur-sm"
  //           initial={{ opacity: 0, x: -20 }}
  //           animate={{ opacity: 1, x: 0 }}
  //           transition={{ delay: index * 0.2 }}
  //           whileHover={{ scale: 1.05 }}
  //         >
  //           <div className="flex justify-center mb-4">{feature.icon}</div>
  //           <h3 className="text-xl font-bold mb-2 text-center">
  //             {feature.title}
  //           </h3>
  //           <p className="text-center text-sm">{feature.description}</p>
  //         </motion.div>
  //       ))}
  //     </div>

  //     <motion.div
  //       className="text-center my-16"
  //       initial={{ opacity: 0 }}
  //       animate={{ opacity: 1 }}
  //       transition={{ delay: 1 }}
  //     >
  //       <h2 className="text-3xl font-bold mb-8">
  //         Powered by Advanced Technology
  //       </h2>
  //       <div className="flex flex-wrap justify-center gap-4">
  //         {["Python", "TensorFlow", "PyTorch", "BERT", "Kafka", "Neo4j"].map(
  //           (tech, index) => (
  //             <span
  //               key={index}
  //               className="px-4 py-2 bg-fuchsia-600 text-white rounded-full text-sm"
  //             >
  //               {tech}
  //             </span>
  //           )
  //         )}
  //       </div>
  //     </motion.div>
  //   </div>
  // );

  return (
    <>
    <Navbar />
    <div className="min-h-screen">
      <div className="h-screen">
        <Spline scene="https://prod.spline.design/gbC1n3NsKQP9dZdE/scene.splinecode" />
      </div>

      <motion.div
        className="p-8 relative"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="fixed inset-0 -z-10">
          <Spline scene="https://prod.spline.design/X6jdVTy-ZKbG6qTK/scene.splinecode" />
        </div>

        <motion.div
          className="text-center my-16 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-white">
            Powered by Advanced Technology
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["TensorFlow", "PyTorch", "BERT", "Real-time broadcasting", "NLP", "Python", "React", "Fact-check API"].map(
              (tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#3737bd] text-white rounded-full text-sm"
                >
                  {tech}
                </span>
              )
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-16 relative z-10">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl border border-[#a54c72] bg-opacity-5 bg-white backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-center text-white">
                    {feature.title}
                  </h3>
                  <p className="text-center text-sm text-white">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
    </>
  );

};

export default Home;
