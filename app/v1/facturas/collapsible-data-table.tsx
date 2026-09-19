"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

interface CollapsibleDataTableProps<T> {
    data: T[];
    groupBy: keyof T;
    columns: Array<{
        key: keyof T;
        header: string;
        width?: string;
        className?: string;
        render?: (value: any, row: T) => React.ReactNode;
    }>;
    onRowClick?: (row: T) => void;
}

export function CollapsibleDataTable<T extends Record<string, any>>({
    data,
    groupBy,
    columns,
    onRowClick,
}: CollapsibleDataTableProps<T>) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const groupedData = useMemo(() => {
        const groups = new Map<string, T[]>();

        data.forEach((item) => {
            const key = String(item[groupBy]);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(item);
        });

        return Array.from(groups.entries()).map(([groupKey, items]) => ({
            groupKey,
            items,
            isExpanded: expandedGroups[groupKey] ?? false,
        }));
    }, [data, groupBy, expandedGroups]);

    const toggleGroup = (groupKey: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }));
    };

    return (
        <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0 z-10">
                    <tr>
                        <th className="w-12 px-4 py-3"></th>
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={cn(
                                    "px-4 py-3 text-left font-medium border-b",
                                    col.className
                                )}
                                style={{ width: col.width }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {groupedData.map(({ groupKey, items, isExpanded }) => (
                        <>
                            {/* Fila Cabecera */}
                            <tr
                                key={groupKey}
                                className="border-b bg-muted/30 hover:bg-muted/50 cursor-pointer"
                                onClick={() => toggleGroup(groupKey)}
                            >
                                <td className="px-4 py-3">
                                    <button className="flex items-center justify-center w-6 h-6">
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5" />
                                        )}
                                    </button>
                                </td>
                                {columns.map((col, i) => (
                                    <td key={i} className="px-4 py-3 font-medium">
                                        {col.render
                                            ? col.render(items[0][col.key], items[0])
                                            : items[0][col.key]}
                                        {items.length > 1 && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                ({items.length})
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Filas Hijas */}
                            {isExpanded &&
                                items.slice(1).map((row, idx) => (
                                    <tr
                                        key={`${groupKey}-${idx}`}
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        <td className="px-4 py-3"></td>
                                        {columns.map((col, i) => (
                                            <td key={i} className="px-4 py-3">
                                                {col.render
                                                    ? col.render(row[col.key], row)
                                                    : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}