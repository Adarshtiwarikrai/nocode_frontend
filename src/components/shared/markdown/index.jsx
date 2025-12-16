import React, { useContext, createContext } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import RemarkBreaks from 'remark-breaks';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './markdown.css';
import { CopyButton } from '../../ui/copybutton';
import { createLowlight, common } from 'lowlight';
import clsx from 'clsx';

let lowlight;
try {
  lowlight = createLowlight(common);
} catch (e) {
  // Fallback if createLowlight fails
  lowlight = {
    highlightAuto: (code) => ({
      value: code,
      data: { language: 'text' }
    })
  } ;
}

// Create a simple theme context as replacement for next-themes
const ThemeContext = createContext<{ theme: 'light' | 'dark' }>({ theme: 'light' });

// Custom hook to get theme - you can implement this based on your theme solution
const useTheme = () => {
  // Option 1: Use context
  const context = useContext(ThemeContext);
  
  // Option 2: Read from localStorage or state management
  // const [theme, setTheme] = useState<'light' | 'dark'>(() => {
  //   return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  // });
  
  // Option 3: Detect system preference
  // const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  return { resolvedTheme: context.theme };
};

const CodeBlock = ({ language, children }) => {
  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === 'dark' ? vscDarkPlus : vs;
  const detectedLanguage =
    language || lowlight.highlightAuto(children).data?.language;
  return (
    <SyntaxHighlighter
      language={detectedLanguage}
      style={style}
      wrapLongLines
      className="rounded-md p-2 my-2"
    >
      {children}
    </SyntaxHighlighter>
  );
};

const InlineCode = ({ children }) => (
  <code className="px-[0.3rem] py-[0.2rem] font-mono text-sm bg-muted rounded-md">
    {children}
  </code>
);

const CodeComponent = ({
  node,
  inline,
  className,
  children,
  suppressCopy,
  ...props
}) => {
  const match = /language-(\w+)/.exec(className || '');

  // Handle inline code differently
  if (inline) {
    return <InlineCode {...props}>{children}</InlineCode>;
  }

  // Only wrap in div and add copy button for block code
  return (
    <div className="relative">
      <CodeBlock language={match && match[1]} {...props}>
        {children}
      </CodeBlock>
      {!suppressCopy && (
        <CopyButton
          content={String(children).replace(/\n$/, '')}
          className="absolute top-1 right-1"
        />
      )}
    </div>
  );
};
export const Markdown = ({
  className,
  suppressLink,
  suppressCopy,
  children,
  ...props
}) => {
  if (!children) return null;

  function preprocessImageTags(content) {
    const imgTagRegex = /<img (https?:\/\/[^">]+)>/g;
    return content.replace(imgTagRegex, (match, p1) => `![img](${p1})`);
  }

  const markdownWithImages= preprocessImageTags(children);

  const processedMarkdown = markdownWithImages
    .replace(/^---\n(.*?)\n---/ms, '\\---\n$1\n\\---')
    .replace(/^(.+)\n---/m, '$1\n\n---')
    .replace(/\\\((.*?)\\\)/g, (match, p1) => `$${p1}$`)
    .replace(/\\\[(.*?)\\\]/gs, (match, p1) => `$$${p1}$$`);

  return (
    <div className={clsx(className, 'markdown')}>
      <ReactMarkdown
        remarkPlugins={[RemarkBreaks, RemarkMath]}
        rehypePlugins={[RehypeKatex]}
        components={{
          code(props) {
            const isInline =
              props.node?.position?.start.line === props.node?.position?.end.line;
            const match = /language-(\w+)/.exec(props.className || '');
            return (
              <CodeComponent
                inline={isInline}
                className={props.className}
                language={match?.[1]}
                {...props}
              >
                {props.children}
              </CodeComponent>
            );
          },
          p({ node, children, ...props }) {
            return <div {...props}>{children}</div>;
          },
          a(data) {
            return suppressLink ? (
              <span className="text-primary" {...data} />
            ) : (
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary link link-hover"
                {...data}
              />
            );
          },
          img: ({ node, ...props }) => (
            <img
              style={{ maxWidth: '480px', width: '100%', maxHeight: '320px' }}
              alt={props.alt ?? 'md-img'}
              {...props}
            />
          ),
        }}
        {...props}
      >
        {processedMarkdown}
      </ReactMarkdown>
    </div>
  );
};
