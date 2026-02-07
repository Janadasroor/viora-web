import React, { useState, useEffect, useRef } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { X, Plus, Smile, Trash2, RotateCw, Maximize, Sun, Check } from "lucide-react";
import type { StickerItem } from "@/types/api/story.types";

interface StickerEditorProps {
    items: StickerItem[];
    onChange: (items: StickerItem[]) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    readOnly?: boolean;
}

const EMOJI_LIST = ["🔥", "❤️", "😂", "😍", "👍", "🎉", "✨", "💯", "👀", "🙌", "😎", "🤔", "💩", "🦄", "🌈", "🍕", "🍔", "🍺", "🚀", "💡"];

interface DraggableStickerItemProps {
    item: StickerItem;
    containerSize: { width: number; height: number };
    readOnly: boolean;
    isSelected: boolean;
    onDragStop: (id: string, e: DraggableEvent, data: DraggableData) => void;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

const DraggableStickerItem = ({
    item,
    containerSize,
    readOnly,
    isSelected,
    onDragStop,
    onSelect,
    onDelete
}: DraggableStickerItemProps) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    const x = (item.transform?.position?.x || 0) * containerSize.width;
    const y = (item.transform?.position?.y || 0) * containerSize.height;

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x, y }}
            onStop={(e, data) => onDragStop(item.id, e, data)}
            disabled={readOnly}
            bounds="parent"
        >
            <div
                ref={nodeRef}
                className={`absolute cursor-move pointer-events-auto group ${isSelected ? 'ring-2 ring-purple-500 rounded-lg' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!readOnly) onSelect(item.id);
                }}
                style={{
                    fontSize: '48px',
                    transform: `scale(${item.transform?.scale || 1}) rotate(${item.transform?.rotation || 0}deg)`,
                    opacity: item.opacity ?? 1,
                    zIndex: item.zIndex,
                    userSelect: 'none',
                    padding: '4px'
                }}
            >
                {item.emoji}
                {!readOnly && isSelected && (
                    <button
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity transform scale-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                        }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </Draggable>
    );
};

export default function StickerEditor({
    items,
    onChange,
    containerRef,
    readOnly = false
}: StickerEditorProps) {
    const safeItems = Array.isArray(items) ? items : [];
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (containerRef.current) {
            const updateSize = () => {
                if (containerRef.current) {
                    const { width, height } = containerRef.current.getBoundingClientRect();
                    setContainerSize({ width, height });
                }
            };

            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }
    }, [containerRef]);

    const handleDragStop = (id: string, e: DraggableEvent, data: DraggableData) => {
        if (readOnly) return;

        const { x, y } = data;
        const normalizedX = x / containerSize.width;
        const normalizedY = y / containerSize.height;

        const newItems = safeItems.map(item =>
            item.id === id
                ? {
                    ...item,
                    transform: {
                        ...item.transform,
                        position: { x: normalizedX, y: normalizedY }
                    }
                }
                : item
        );
        onChange(newItems);
    };

    const handleAddSticker = (emoji: string) => {
        const newItem: StickerItem = {
            id: `stk_${Date.now()}`,
            type: "emoji",
            emoji: emoji,
            transform: {
                position: { x: 0.5, y: 0.5 },
                scale: 1.0,
                rotation: 0
            },
            opacity: 1.0,
            zIndex: items.length + 1
        };
        onChange([...safeItems, newItem]);
        setSelectedId(newItem.id);
        setShowPicker(false);
    };

    const handleUpdateItem = (id: string, updates: Partial<StickerItem> | any) => {
        const newItems = safeItems.map(item => {
            if (item.id === id) {
                // Handle nested transform updates
                if (updates.transform) {
                    return {
                        ...item,
                        transform: { ...item.transform, ...updates.transform }
                    };
                }
                return { ...item, ...updates };
            }
            return item;
        });
        onChange(newItems);
    };

    const handleDeleteItem = (id: string) => {
        onChange(safeItems.filter(item => item.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const selectedItem = safeItems.find(item => item.id === selectedId);

    return (
        <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Sticker Items */}
            {safeItems.map((item) => (
                <DraggableStickerItem
                    key={item.id}
                    item={item}
                    containerSize={containerSize}
                    readOnly={readOnly}
                    isSelected={selectedId === item.id}
                    onDragStop={handleDragStop}
                    onSelect={setSelectedId}
                    onDelete={handleDeleteItem}
                />
            ))}

            {/* Controls Overlay */}
            {!readOnly && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                    {/* Top Bar */}
                    <div className="flex justify-end pointer-events-auto mt-16">
                        <button
                            onClick={() => setShowPicker(!showPicker)}
                            className="bg-black/50 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <Smile className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Sticker Picker */}
                    {showPicker && (
                        <div className="absolute top-32 right-4 bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-gray-800 w-64 pointer-events-auto z-50 max-h-64 overflow-y-auto">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white text-sm font-medium">Select Sticker</span>
                                <button
                                    onClick={() => setShowPicker(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {EMOJI_LIST.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleAddSticker(emoji)}
                                        className="text-2xl hover:bg-white/10 p-2 rounded transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Property Panel (only if item selected) */}
                    {selectedItem && (
                        <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 pointer-events-auto mb-16">
                            <div className="flex items-center gap-6 overflow-x-auto">
                                {/* Scale */}
                                <div className="flex items-center gap-2">
                                    <Maximize className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.1"
                                        value={selectedItem.transform?.scale || 1}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, {
                                            transform: { scale: parseFloat(e.target.value) }
                                        })}
                                        className="w-24 accent-purple-500"
                                    />
                                </div>

                                {/* Rotation */}
                                <div className="flex items-center gap-2">
                                    <RotateCw className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={selectedItem.transform?.rotation || 0}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, {
                                            transform: { rotation: parseInt(e.target.value) }
                                        })}
                                        className="w-24 accent-purple-500"
                                    />
                                </div>

                                {/* Opacity */}
                                <div className="flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={selectedItem.opacity ?? 1}
                                        onChange={(e) => handleUpdateItem(selectedItem.id, {
                                            opacity: parseFloat(e.target.value)
                                        })}
                                        className="w-24 accent-purple-500"
                                    />
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDeleteItem(selectedItem.id)}
                                    className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                {/* Done Button */}
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="ml-auto p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
