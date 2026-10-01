"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
}

interface TextSegment {
  type: "text" | "inline-math" | "block-math";
  content: string;
}

/**
 * Parses mixed text, Bengali Unicode, and LaTeX math formulas.
 * Supports:
 * - Block math: `$$...$$` or `\[...\]`
 * - Inline math: `$...$` or `\(...\)`
 * - Plain text and Bengali Unicode: preserving all characters intact.
 */
function parseMixedContent(input: string): TextSegment[] {
  if (!input) return [];

  const segments: TextSegment[] = [];
  // Regex to match block math ($$...$$ or \[...\]) and inline math ($...$ or \(...\))
  // Uses non-greedy matching to support multiple formulas in one sentence
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?!\$)[\s\S]*?\$|\\\([\s\S]*?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: input.slice(lastIndex, match.index),
      });
    }

    const matchedStr = match[0];

    if (matchedStr.startsWith("$$") && matchedStr.endsWith("$$")) {
      segments.push({
        type: "block-math",
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith("\\[") && matchedStr.endsWith("\\]")) {
      segments.push({
        type: "block-math",
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith("$") && matchedStr.endsWith("$")) {
      segments.push({
        type: "inline-math",
        content: matchedStr.slice(1, -1).trim(),
      });
    } else if (matchedStr.startsWith("\\(") && matchedStr.endsWith("\\)")) {
      segments.push({
        type: "inline-math",
        content: matchedStr.slice(2, -2).trim(),
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining plain text
  if (lastIndex < input.length) {
    segments.push({
      type: "text",
      content: input.slice(lastIndex),
    });
  }

  return segments;
}

export function MathText({ text, className, as: Component = "span" }: MathTextProps) {
  const segments = useMemo(() => parseMixedContent(text), [text]);

  if (!text) return null;

  return (
    <Component className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        const isBlock = segment.type === "block-math";

        try {
          const html = katex.renderToString(segment.content, {
            displayMode: isBlock,
            throwOnError: false,
            strict: false,
          });

          return (
            <span
              key={index}
              className={isBlock ? "block my-2 text-center overflow-x-auto" : "inline-block px-0.5 align-middle"}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          // Fallback if KaTeX syntax fails
          return (
            <code key={index} className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
              {segment.content}
            </code>
          );
        }
      })}
    </Component>
  );
}

export default MathText;
