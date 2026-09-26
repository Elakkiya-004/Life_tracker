import { useState, useRef, useCallback } from 'react';

/**
 * Reusable Drag and Drop hook for reordering task lists
 * Supports both Desktop HTML5 drag/drop and Mobile Touch dragging
 */
export const useTaskDragAndDrop = ({ onReorder }) => {
  const [draggedId, setDraggedId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'before' | 'after'
  const isDraggingRef = useRef(false);

  // Desktop HTML5 Drag Handlers
  const handleDragStart = useCallback((e, id) => {
    isDraggingRef.current = true;
    setDraggedId(id);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    }
  }, []);

  const handleDragOver = useCallback((e, targetId) => {
    e.preventDefault();
    if (!isDraggingRef.current || !draggedId || draggedId === targetId) return;

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';

    setDropTargetId(targetId);
    setDropPosition(position);
  }, [draggedId]);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    if (draggedId && targetId && draggedId !== targetId) {
      if (onReorder) {
        onReorder(draggedId, targetId, dropPosition || 'before');
      }
    }
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
    isDraggingRef.current = false;
  }, [draggedId, dropPosition, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
    isDraggingRef.current = false;
  }, []);

  // Mobile Touch Handlers
  const touchStartY = useRef(0);
  const currentTouchTargetId = useRef(null);

  const handleTouchStart = useCallback((e, id) => {
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
    }
    setDraggedId(id);
    isDraggingRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current || !draggedId) return;

    const touch = e.touches ? e.touches[0] : null;
    if (!touch) return;

    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;

    const card = elem.closest('.todo-item-card[data-id]');
    if (card) {
      const targetId = card.getAttribute('data-id');
      if (targetId && targetId !== draggedId) {
        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = touch.clientY < midY ? 'before' : 'after';
        setDropTargetId(targetId);
        setDropPosition(position);
        currentTouchTargetId.current = targetId;
      }
    }
  }, [draggedId]);

  const handleTouchEnd = useCallback(() => {
    if (isDraggingRef.current && draggedId && currentTouchTargetId.current && draggedId !== currentTouchTargetId.current) {
      if (onReorder) {
        onReorder(draggedId, currentTouchTargetId.current, dropPosition || 'before');
      }
    }
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
    currentTouchTargetId.current = null;
    isDraggingRef.current = false;
  }, [draggedId, dropPosition, onReorder]);

  return {
    draggedId,
    dropTargetId,
    dropPosition,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
