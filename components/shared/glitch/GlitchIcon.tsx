"use client";

import { useEffect, useState } from "react";

interface GlitchIconProps {
    size?: number;
    className?: string;
}

const COLORS = {
    purple: "#894B85",
    pink: "#EF0D90",
    orange: "#FDC579",
    yellow: "#FEF759",
};

export default function GlitchIcon({ size = 72, className = "" }: GlitchIconProps) {
    const [gridState, setGridState] = useState<number[][]>([
        [0, 1, 2, 3],
        [1, 0, 3, 2],
        [2, 3, 0, 1],
        [3, 2, 1, 0],
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
                    newGrid[row][col] = Math.floor(Math.random() * 4);
                }
                return newGrid;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    const getColor = (value: number) => {
        switch (value) {
            case 0:
                return COLORS.purple;
            case 1:
                return COLORS.pink;
            case 2:
                return COLORS.orange;
            case 3:
                return COLORS.yellow;
            default:
                return COLORS.purple;
        }
    };

    const getOpacity = (value: number) => {
        const opacities = [1, 0.8, 0.6, 0.4];
        return opacities[value % 4];
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
