import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
const fs = window.require('fs'); 

function Documentation() {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    fs.readFile('../../Worldgen/README.md', 'utf8', (err, data) => {
        if (err) {
        console.error('Error reading README file:', err);
        return;
      }
      setMarkdown(data);
    });
  }, []);

  return (
    <div class="documentation">
        <h2>Documentation</h2>
        <p className="documentation-desc">To view full documentation or to contribute to open source, visit our <a href="https://github.com/popnerdstudios/WorldGen/" target="_blank">GitHub</a></p>
        <div class="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
    </div>

  );
}

export default Documentation;
