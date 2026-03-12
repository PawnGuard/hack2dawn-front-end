"use client";

import { useEffect, useState } from "react";

interface GlitchIconProps {
    size?: number;
    className?: string;
}

const COLORS = {
    dark_magenta: "#940992",
    shocking_pink: "#EF01BA",
    harvest_orange: "#F77200",
    canary_yellow: "#FEF759",
    indigo: "#430464",
    coffee_bean: "#1E0513",
    lavender_mist: "#F4EDF2"


};

export default function GlitchIcon({ size = 72, className = "" }: GlitchIconProps) {
    const [gridState, setGridState] = useState<number[][]>([
        [0, 1, 2, 3],
        [1, 4, 3, 2],
        [2, 5, 0, 1],
        [3, 6, 1, 0],
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setGridState((prev) => {
                const newGrid = prev.map((row) => [...row]);
                // Randomly change some grid positions
                const changes = Math.floor(Math.random() * 4) + 2;
                for (let i = 0; i < changes; i++) {
                    const row = Math.floor(Math.random() * 4);
                    const col = Math.floor(Math.random() * 4);
                    newGrid[row][col] = Math.floor(Math.random() * 7);
                }
                return newGrid;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    const getColor = (value: number) => {
        switch (value) {
            case 0:
                return COLORS.dark_magenta;
            case 1:
                return COLORS.shocking_pink;
            case 2:
                return COLORS.harvest_orange;
            case 3:
                return COLORS.canary_yellow;
            case 4:
                return COLORS.indigo;
            case 5:
                return COLORS.coffee_bean;
            case 6:
                return COLORS.lavender_mist;
            default:
                return COLORS.dark_magenta;
        }
    };

    const getOpacity = (value: number) => {
        const opacities = [1, 0.9, 0.8, 0.7, 0.85, 0.75, 0.95];
        return opacities[value % 7];
    };

    // Inline styles required for dynamic animation
    return (
        <div 
            className={`inline-block ${className}`} 
            style={{ 
                width: `${size}px`, 
                height: `${size}px` 
            } as React.CSSProperties}
        >
            <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-0">
                {gridState.map((row, rowIndex) =>
                    row.map((value, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className="transition-all duration-150 ease-in-out"
                            style={{
                                "--glitch-bg": getColor(value),
                                "--glitch-opacity": getOpacity(value),
                                backgroundColor: `var(--glitch-bg)`,
                                opacity: `var(--glitch-opacity)`,
                            } as React.CSSProperties}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
