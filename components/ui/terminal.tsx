"use client";

import { useEffect, useMemo, useState } from "react";

interface TerminalProps {
  commands: string[];
  outputs?: Record<number, string[]>;
  typingSpeed?: number;
  delayBetweenCommands?: number;
  className?: string;
}

export function Terminal({
  commands,
  outputs = {},
  typingSpeed = 50,
  delayBetweenCommands = 900,
  className,
}: TerminalProps) {
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    setActiveCommandIndex(0);
    setTypedChars(0);
  }, [commands]);

  useEffect(() => {
    if (!commands.length || activeCommandIndex >= commands.length) return;

    const currentCommand = commands[activeCommandIndex] ?? "";

    if (typedChars < currentCommand.length) {
      const timer = window.setTimeout(() => {
        setTypedChars((value) => value + 1);
      }, typingSpeed);

      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setActiveCommandIndex((index) => index + 1);
      setTypedChars(0);
    }, delayBetweenCommands);

    return () => window.clearTimeout(timer);
  }, [activeCommandIndex, commands, delayBetweenCommands, typedChars, typingSpeed]);

  const hasCommands = commands.length > 0;
  const done = hasCommands && activeCommandIndex >= commands.length;

  const lines = useMemo(() => {
    const result: Array<{ id: string; text: string; isCommand: boolean }> = [];

    for (let index = 0; index < commands.length; index += 1) {
      const command = commands[index];

      if (index < activeCommandIndex) {
        result.push({ id: `cmd-${index}`, text: `$ ${command}`, isCommand: true });
        for (const [lineIndex, line] of (outputs[index] ?? []).entries()) {
          result.push({ id: `out-${index}-${lineIndex}`, text: line, isCommand: false });
        }
        continue;
      }

      if (index === activeCommandIndex) {
        const typed = command.slice(0, typedChars);
        const showCursor = !done;
        result.push({
          id: `cmd-${index}`,
          text: `$ ${typed}${showCursor ? "_" : ""}`,
          isCommand: true,
        });

        if (typedChars >= command.length) {
          for (const [lineIndex, line] of (outputs[index] ?? []).entries()) {
            result.push({ id: `out-${index}-${lineIndex}`, text: line, isCommand: false });
          }
        }
        break;
      }

      break;
    }

    return result;
  }, [activeCommandIndex, commands, done, outputs, typedChars]);

  return (
    <section className={`w-full border border-[#22d3ee]/30 bg-[#02080f] ${className ?? ""}`}>
      <header className="flex items-center justify-between border-b border-[#22d3ee]/20 bg-[#05121e] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#facc15]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#67e8f9]">secure-shell://expediente</p>
      </header>

      <div className="max-h-72 space-y-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed sm:text-sm">
        {lines.map((line) => (
          <p
            key={line.id}
            className={line.isCommand ? "text-[#a5f3fc]" : "text-[#d1d5db]"}
          >
            {line.text}
          </p>
        ))}

        {!hasCommands ? <p className="text-[#94a3b8]">$ waiting for command...</p> : null}
      </div>
    </section>
  );
}
