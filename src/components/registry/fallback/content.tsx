/**
 * Fallback content section — used when no registered component matches
 * the requested category/variant.  Renders the section Markdown content
 * in a readable, unstyled prose block.
 */
import React from 'react';

interface Props {
  content: string;
  structured?: Record<string, unknown>;
  images?: Array<{ src: string; alt: string; width?: number; height?: number }>;
  className?: string;
}

export default function FallbackContent({ content, className = '' }: Props) {
  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="container mx-auto max-w-4xl prose prose-neutral dark:prose-invert">
        <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
          {content}
        </div>
      </div>
    </section>
  );
}
