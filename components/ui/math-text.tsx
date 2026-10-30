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
 * Pre-normalizes raw text to repair scraper artifacts, broken $ placements,
 * degree symbols, and unwrapped LaTeX commands before segment parsing.
 */
function normalizeMathInput(raw: string): string {
  if (!raw) return "";
  let s = raw;

  // 0. Auto-heal literal \n into real newlines (while safely protecting LaTeX commands like \neq, \nabla, \nu, \notin)
  s = s.replace(/\\n(?![a-zA-Z])/g, "\n");

  // 0.1 Auto-heal double-escaped LaTeX commands (\\frac -> \frac, \\implies -> \implies, etc.)
  s = s.replace(/\\\\([a-zA-Z]+)/g, (_, p1) => "\\" + p1);

  // 1. Repair false English macros (e.g. \sin{gular} -> singular, \sec{ond} -> second)
  s = s.replace(/\\(sin|sec|tan|cos|log)\{([a-z]{2,})\}/g, "$1$2");
  s = s.replace(/\$?\\frac\{a\}\{an-?\}\$?/gi, (m) => (m.includes("-") ? "a/an-" : "a/an"));

  // 2. Fix \frac{\sqrt{A}{B}} -> \sqrt{\frac{A}{B}}
  s = s.replace(/\\frac\{\\sqrt\{([^{}]+)\}\{([^{}]+)\}\}/g, "\\sqrt{\\frac{$1}{$2}}");

  // 3. Convert ^\circ and \circ to clean Unicode degree symbol °
  s = s.replace(/\^\s*\\circ\s*([CFN])/g, "°$1");
  s = s.replace(/\\circ\s*([CFN])/g, "°$1");
  s = s.replace(/\^\s*\\circ/g, "°");
  s = s.replace(/\\circ/g, "°");
  s = s.replace(/°([\u0980-\u09FF])/g, "° $1");

  // 4. Repair broken $ inside \frac${ or \sqrt${
  if (/\\(frac|sqrt)\$\{/.test(s)) {
    s = s.replace(/\$/g, "");
  }

  // 5. Fix \angle\text{A} -> \angle A
  s = s.replace(/\\angle\\text\{([^{}]+)\}/g, "\\angle $1");

  return s;
}

/**
 * Splits a plain text segment that may still contain unwrapped LaTeX commands
 * (e.g., \frac{3}{2}, \sqrt{x}, \le, x^2) into text and inline-math segments.
 */
function splitUnwrappedLatex(text: string): TextSegment[] {
  if (!/(\\(?:frac|sqrt|le|ge|ne|pm|angle|log|sin|cos|tan|sec|cup|cap|cdot|times)|[a-zA-Z0-9)]+\^[0-9a-zA-Z+\-]+)/.test(text)) {
    return [{ type: "text", content: text }];
  }

  const result: TextSegment[] = [];
  const tokenRegex = /(\([ \t]*\\frac\{[^{}]*\}\{[^{}]*\}[ \t]*\)(?:\^(?:\{[^{}]*\}|[0-9a-zA-Z+\-]+))?|\\(?:frac|sqrt)(?:\[[^\]]*\])?\{[^{}]*\}(?:\{[^{}]*\})?|\\(?:le|ge|ne|pm|times|div|cdot|cup|cap)|\\angle\s*[A-Za-z]+|\\log(?:_\{[^{}]*\}|_[a-zA-Z0-9]+)?(?:\{[^{}]*\})?|[a-zA-Z0-9)]+\^(?:\{[^{}]*\}|[0-9a-zA-Z+\-]+))/g;

  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      result.push({ type: "text", content: text.slice(lastIdx, m.index) });
    }
    result.push({ type: "inline-math", content: m[0].trim() });
    lastIdx = tokenRegex.lastIndex;
  }
  if (lastIdx < text.length) {
    result.push({ type: "text", content: text.slice(lastIdx) });
  }
  return result;
}

/**
 * Parses mixed text, Bengali Unicode, and LaTeX math formulas.
 * Supports:
 * - Block math: `$$...$$` or `\[...\]`
 * - Inline math: `$...$` or `\(...\)`
 * - Unwrapped LaTeX commands: `\frac{a}{b}`, `\sqrt{x}`, `\le`, `x^2`, etc.
 * - Plain text and Bengali Unicode: preserving all characters intact.
 */
function parseMixedContent(rawInput: string): TextSegment[] {
  if (!rawInput) return [];
  const input = normalizeMathInput(rawInput);

  const segments: TextSegment[] = [];
  // Regex to match block math ($$...$$ or \[...\]) and inline math ($...$ or \(...\))
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?!\$)[\s\S]*?\$|\\\([\s\S]*?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // Push preceding plain text (with fallback check for unwrapped LaTeX)
    if (match.index > lastIndex) {
      segments.push(...splitUnwrappedLatex(input.slice(lastIndex, match.index)));
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

  // Push remaining plain text (with fallback check for unwrapped LaTeX)
  if (lastIndex < input.length) {
    segments.push(...splitUnwrappedLatex(input.slice(lastIndex)));
  }

  return segments;
}

export function MathText({ text, className, as: Component = "span" }: MathTextProps) {
  const segments = useMemo(() => parseMixedContent(text), [text]);

  if (!text) return null;

  const combinedClassName = className
    ? `whitespace-pre-line ${className}`
    : "whitespace-pre-line";

  return (
    <Component className={combinedClassName}>
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
