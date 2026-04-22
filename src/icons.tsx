import React from "react";

import { Zap, Shuffle, Hash, Package, MessageSquare, Target, List } from 'lucide-react';
import type { NodeCategory } from './types';

export const CATEGORY_ICONS: Record<NodeCategory, React.ReactNode> = {
  flow: <Zap size={14} />,
  logic: <Shuffle size={14} />,
  math: <Hash size={14} />,
  variable: <Package size={14} />,
  io: <MessageSquare size={14} />,
  event: <Target size={14} />,
  array: <List size={14} />,
};
