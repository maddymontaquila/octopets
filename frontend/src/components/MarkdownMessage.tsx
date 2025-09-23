import React from 'react';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  // Simple markdown parsing - can be enhanced with a proper library later
  const parseMarkdown = (text: string): JSX.Element => {
    // Split by lines and process each line
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={key++} style={{ fontSize: '1.1em', margin: '0.5em 0', fontWeight: '600' }}>{line.substring(4)}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={key++} style={{ fontSize: '1.3em', margin: '0.5em 0', fontWeight: '600' }}>{line.substring(3)}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={key++} style={{ fontSize: '1.5em', margin: '0.5em 0', fontWeight: '600' }}>{line.substring(2)}</h1>);
      }
      // Handle bullet points
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={key++} style={{ margin: '0.25em 0', listStyleType: 'disc', marginLeft: '1.5em' }}>
            {parseInlineMarkdown(line.substring(2))}
          </li>
        );
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^\d+\.\s(.+)$/);
        if (match) {
          elements.push(
            <li key={key++} style={{ margin: '0.25em 0', listStyleType: 'decimal', marginLeft: '1.5em' }}>
              {parseInlineMarkdown(match[1])}
            </li>
          );
        }
      }
      // Handle blockquotes
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={key++} style={{
            borderLeft: '4px solid var(--primary-300)',
            paddingLeft: '1em',
            margin: '0.5em 0',
            fontStyle: 'italic',
            backgroundColor: 'rgba(245, 197, 219, 0.1)'
          }}>
            {parseInlineMarkdown(line.substring(2))}
          </blockquote>
        );
      }
      // Handle empty lines
      else if (line.trim() === '') {
        elements.push(<br key={key++} />);
      }
      // Handle regular paragraphs
      else {
        elements.push(
          <p key={key++} style={{ margin: '0.5em 0' }}>
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    }

    return <div>{elements}</div>;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Handle bold text **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle inline code `code`
    text = text.replace(/`(.*?)`/g, '<code style="background-color: rgba(0,0,0,0.1); padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>');
    
    // Handle links [text](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--primary-500); text-decoration: underline;">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className={`markdown-content ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
};

export default MarkdownMessage;