import { motion, AnimatePresence } from 'framer-motion';

interface PromptHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptHelper({ isOpen, onClose }: PromptHelperProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" onClick={onClose}>
          <motion.div 
            className="neu-container prompt-helper"
            style={{ 
              maxWidth: '600px', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              margin: '2rem auto'
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3">How to Use the Quiz Generator Prompt</h2>
            
            <div className="mb-3">
              <h3 className="mb-2">Step 1: Copy the Prompt</h3>
              <p>Click the "Copy Quiz Generator Prompt" button on the main screen to copy the prompt to your clipboard.</p>
            </div>
            
            <div className="mb-3">
              <h3 className="mb-2">Step 2: Use With Your Favorite AI</h3>
              <p>Paste the prompt in ChatGPT, Claude, or any other AI chat tool.</p>
            </div>
            
            <div className="mb-3">
              <h3 className="mb-2">Step 3: Add Your Content</h3>
              <p>Replace the placeholder text "[PASTE YOUR CONTENT HERE]" with any content you want to create a quiz for, such as:</p>
              <ul className="mb-2" style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                <li>Articles or blog posts</li>
                <li>Book chapters or summaries</li>
                <li>Lecture notes</li>
                <li>Study materials</li>
                <li>Wikipedia articles</li>
              </ul>
            </div>
            
            <div className="mb-3">
              <h3 className="mb-2">Step 4: Generate and Use</h3>
              <p>The AI will create a quiz in the exact JSON format our app needs.</p>
              <p>Copy the entire JSON output and paste it into the text area in Quizzler to start your quiz!</p>
            </div>
            
            <div className="mb-4">
              <h3 className="mb-2">Tips</h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                <li>Make sure to copy the entire JSON output, including the opening and closing brackets.</li>
                <li>If you get any errors, check that the JSON is valid and properly formatted.</li>
                <li>For best results, provide focused content on a single topic rather than broad material.</li>
              </ul>
            </div>
            
            <div className="text-center">
              <button 
                className="neu-button"
                onClick={onClose}
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 