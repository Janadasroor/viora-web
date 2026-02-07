import React, { useState, useRef, useEffect } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { X, Plus, Type, Palette, AlignLeft, Move, Trash2, Check } from "lucide-react";
import type { TextOverlayItem } from "@/types/api/story.types";

interface TextOverlayEditorProps {
    items: TextOverlayItem[];
    onChange: (items: TextOverlayItem[]) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    readOnly?: boolean;
}

interface DraggableTextItemProps {
    item: TextOverlayItem;
    containerSize: { width: number; height: number };
    readOnly: boolean;
    isSelected: boolean;
    onDragStop: (id: string, e: DraggableEvent, data: DraggableData) => void;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

const DraggableTextItem = ({
    item,
    containerSize,
    readOnly,
    isSelected,
    onDragStop,
    onSelect,
    onDelete
}: DraggableTextItemProps) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    // Calculate pixel position from normalized coordinates
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
                    color: item.font?.color || '#ffffff',
                    fontSize: `${item.font?.size || 24}px`,
                    fontWeight: item.font?.weight || 'normal',
                    fontFamily: item.font?.family || 'sans-serif',
                    backgroundColor: item.style?.backgroundColor || 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    padding: '4px 8px',
                    userSelect: 'none'
                }}
            >
                {item.text}
                {!readOnly && isSelected && (
                    <button
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                        }}
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
        </Draggable>
    );
};

export default function TextOverlayEditor({
    items,
    onChange,
    containerRef,
    readOnly = false
}: TextOverlayEditorProps) {
    const safeItems = Array.isArray(items) ? items : [];
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

    const handleAddText = () => {
        const newItem: TextOverlayItem = {
            id: `txt_${Date.now()}`,
            text: "New Text",
            font: {
                size: 24,
                color: "#ffffff",
                weight: "bold"
            },
            transform: {
                position: { x: 0.5, y: 0.5 }
            }
        };
        onChange([...safeItems, newItem]);
        setSelectedId(newItem.id);
    };

    const handleUpdateItem = (id: string, updates: Partial<TextOverlayItem> | any) => {
        const newItems = safeItems.map(item => {
            if (item.id === id) {
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
        <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Text Items */}
            {safeItems.map((item) => (
                <DraggableTextItem
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
                    <div className="flex justify-end pointer-events-auto">
                        <button
                            onClick={handleAddText}
                            className="bg-black/50 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Bottom Property Panel (only if item selected) */}
                    {selectedItem && (
                        <div className="bg-black/80 backdrop-blur-md rounded-xl p-4 pointer-events-auto mb-16">
                            <div className="flex flex-col gap-4">
                                {/* Text Input */}
                                <input
                                    type="text"
                                    value={selectedItem.text}
                                    onChange={(e) => handleUpdateItem(selectedItem.id, { text: e.target.value })}
                                    className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
                                />

                                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                                    {/* Color Picker */}
                                    <div className="flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="color"
                                            value={selectedItem.font?.color || "#ffffff"}
                                            onChange={(e) => handleUpdateItem(selectedItem.id, {
                                                font: { ...selectedItem.font, color: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        />
                                    </div>

                                    {/* Font Size */}
                                    <div className="flex items-center gap-2">
                                        <Type className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="range"
                                            min="12"
                                            max="72"
                                            value={selectedItem.font?.size || 24}
                                            onChange={(e) => handleUpdateItem(selectedItem.id, {
                                                font: { ...selectedItem.font, size: parseInt(e.target.value) }
                                            })}
                                            className="w-24 accent-purple-500"
                                        />
                                    </div>

                                    {/* Background Color */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-gray-400 bg-gray-600" />
                                        <input
                                            type="color"
                                            value={selectedItem.style?.backgroundColor || "#000000"}
                                            onChange={(e) => handleUpdateItem(selectedItem.id, {
                                                style: { ...selectedItem.style, backgroundColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        />
                                        <button
                                            onClick={() => handleUpdateItem(selectedItem.id, {
                                                style: { ...selectedItem.style, backgroundColor: 'transparent' }
                                            })}
                                            className="text-xs text-gray-400 hover:text-white"
                                        >
                                            Clear
                                        </button>
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
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
