import { useState, useRef, useCallback, useEffect } from 'react';

export const usePanelResizing = () => {
    const [panelWidths, setPanelWidths] = useState({ left: 256, middle: window.innerWidth - 256 - 350, right: 350 });
    const [bottomPanelHeight, setBottomPanelHeight] = useState(250);

    const isResizingVertical = useRef<number | null>(null);
    const isResizingHorizontal = useRef(false);
    const ideContainerRef = useRef<HTMLDivElement>(null);

    const handleMouseDownVertical = (dividerIndex: number) => { isResizingVertical.current = dividerIndex; };
    const handleMouseDownHorizontal = () => { isResizingHorizontal.current = true; };
    
    const handleMouseUp = useCallback(() => {
        isResizingVertical.current = null;
        isResizingHorizontal.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizingVertical.current !== null && ideContainerRef.current) {
            const rect = ideContainerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            setPanelWidths(prev => {
                const totalWidth = prev.left + prev.middle + prev.right;
                if (isResizingVertical.current === 0) { // Left divider
                    const newLeft = Math.max(200, Math.min(mouseX, totalWidth - prev.right - 200));
                    return { ...prev, left: newLeft, middle: totalWidth - newLeft - prev.right };
                } else { // Right divider
                    const newRight = Math.max(200, Math.min(totalWidth - mouseX, totalWidth - prev.left - 200));
                    return { ...prev, right: newRight, middle: totalWidth - prev.left - newRight };
                }
            });
        }
        if (isResizingHorizontal.current) {
            setBottomPanelHeight(Math.max(50, Math.min(window.innerHeight - e.clientY, window.innerHeight * 0.6)));
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return {
        panelWidths,
        bottomPanelHeight,
        handleMouseDownVertical,
        handleMouseDownHorizontal,
        ideContainerRef
    };
};
