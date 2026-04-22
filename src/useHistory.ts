import { useState, useCallback } from "react";
import type { NodeData, Wire } from "./types";

interface HistoryState {
    nodes: NodeData[];
    wires: Wire[];
}

export function useHistory(initialState: HistoryState) {
    const [, setPast] = useState<HistoryState[]>([]);
    const [present, setPresent] = useState<HistoryState>(initialState);
    const [, setFuture] = useState<HistoryState[]>([]);

    const pushState = useCallback((updater: HistoryState | ((prev: HistoryState) => HistoryState), replace = false) => {
        setPresent(prev => {
            const newState = typeof updater === 'function' ? updater(prev) : updater;
            if (!replace) {
                setPast(p => [...p, prev]);
                setFuture([]);
            }
            return newState;
        });
    }, []);

    const undo = useCallback(() => {
        setPast(p => {
            if (p.length === 0) return p;
            const previous = p[p.length - 1];
            setPresent(prev => {
                setFuture(f => [prev, ...f]);
                return previous;
            });
            return p.slice(0, p.length - 1);
        });
    }, []);

    const redo = useCallback(() => {
        setFuture(f => {
            if (f.length === 0) return f;
            const next = f[0];
            setPresent(prev => {
                setPast(p => [...p, prev]);
                return next;
            });
            return f.slice(1);
        });
    }, []);

    return { present, setPresent: pushState, undo, redo };
}
