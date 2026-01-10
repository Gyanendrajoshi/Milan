"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    OnChangeFn,
    RowSelectionState,
    VisibilityState,
} from "@tanstack/react-table"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, LayoutGrid, List, Settings2, Download, RotateCcw, ArrowUpDown, ChevronUp, MoreHorizontal, Check, Circle } from "lucide-react"

import { useGridSettings } from "@/hooks/useGridSettings"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    placeholder?: string
    searchValue?: string // New prop for external search value
    hideSearchBar?: boolean // New prop to hide internal search bar
    enableRowSelection?: boolean
    rowSelection?: RowSelectionState
    onRowSelectionChange?: OnChangeFn<RowSelectionState>
    hideToolbar?: boolean
    hidePagination?: boolean
    disableResponsive?: boolean
    getRowId?: (originalRow: TData, index: number, parent?: any) => string
    onSearch?: (value: string) => void
    toolbarExtras?: React.ReactNode
    gridId?: string
    isLoading?: boolean
}

const downloadCSV = (data: any[], filename = 'export.csv') => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    placeholder = "Search...",
    searchValue,
    onSearch,
    hideSearchBar = false,
    enableRowSelection = false,
    rowSelection,
    onRowSelectionChange,
    hideToolbar = false,
    hidePagination = false,
    disableResponsive = false,
    getRowId,
    toolbarExtras,
    gridId,
    isLoading = false,
}: DataTableProps<TData, TValue>) {
    const { settings, updateColumnVisibility, updateSortingState, updateFilterState, updatePageSize, updateViewMode, saveSettings, clearSettings } = useGridSettings(gridId ?? '')

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [viewMode, setViewMode] = React.useState<"grid" | "card">("grid")
    const [hasLoadedSettings, setHasLoadedSettings] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    // Load settings on mount
    React.useEffect(() => {
        setMounted(true)
        if (gridId && settings && !hasLoadedSettings) {
            if (settings.sortingState?.length) setSorting(settings.sortingState)
            if (settings.filterState?.length) setColumnFilters(settings.filterState)
            if (Object.keys(settings.columnVisibility || {}).length) setColumnVisibility(settings.columnVisibility)
            if (settings.viewMode) setViewMode(settings.viewMode)
            setHasLoadedSettings(true)
        }
    }, [gridId, settings, hasLoadedSettings])

    // Sync changes to persistence (debounced slightly by nature of useEffect, but strictly we should debounce save)
    React.useEffect(() => {
        if (!gridId || !hasLoadedSettings) return
        updateSortingState(sorting)
    }, [sorting, gridId, updateSortingState, hasLoadedSettings])

    React.useEffect(() => {
        if (!gridId || !hasLoadedSettings) return
        updateColumnVisibility(columnVisibility)
    }, [columnVisibility, gridId, updateColumnVisibility, hasLoadedSettings])

    React.useEffect(() => {
        if (!gridId || !hasLoadedSettings) return
        updateViewMode(viewMode)
    }, [viewMode, gridId, updateViewMode, hasLoadedSettings])

    // Pagination sync handled in useReactTable setup if we passed onPaginationChange, but here we just init pageSize

    React.useEffect(() => {
        if (disableResponsive) {
            setViewMode("grid")
            return
        }
        // Only run auto-resize logic if NOT loaded from settings or if explicitly reset? 
        // For now, let settings viewMode take precedence if loaded, else use responsive logic on first load?
        // Actually, existing logic overrides viewMode based on screen size. We should respect that but maybe user preference overrides?
        // Let's keep responsive logic but ONLY if no settings loaded OR if screen is small.
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setViewMode("card")
            } else if (!gridId) {
                // Only forced to grid on large screen if no preference saved
                setViewMode("grid")
            }
        }

        if (!gridId) handleResize() // Only auto-set if no persistence
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [disableResponsive, gridId])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection,
        onRowSelectionChange,
        onColumnVisibilityChange: setColumnVisibility, // Enable visibility control
        initialState: {
            pagination: {
                pageSize: (gridId && settings?.pageSize) ? settings.pageSize : (hidePagination ? 10000 : 100),
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection: rowSelection || {},
        },
        getRowId,
    })

    // Sync external search value with table filter if onSearch is NOT provided (legacy mode)
    // If onSearch is provided, we assume the parent handles filtering
    React.useEffect(() => {
        if (searchKey && searchValue !== undefined && !onSearch) {
            table.getColumn(searchKey)?.setFilterValue(searchValue)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchKey, searchValue, table, onSearch])

    return (
        <div className="flex flex-col h-full space-y-4">
            {!hideToolbar && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                        {toolbarExtras}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                        {(searchKey || onSearch) && !hideSearchBar && (
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={placeholder}
                                    value={searchValue ?? (searchKey ? (table.getColumn(searchKey)?.getFilterValue() as string) : "") ?? ""}
                                    onChange={(event) => {
                                        if (onSearch) {
                                            onSearch(event.target.value)
                                        } else if (searchKey) {
                                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                        }
                                    }}
                                    className="pl-8 h-9 text-sm"
                                />
                            </div>
                        )}

                        {mounted ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-background shrink-0 ml-auto sm:ml-0">
                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => downloadCSV(table.getFilteredRowModel().rows.map(row => row.original))}>
                                        <Download className="mr-2 h-4 w-4" /> Export CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        if (confirm('Are you sure you want to reset all table settings to default?')) {
                                            clearSettings()
                                            setSorting([])
                                            setColumnFilters([])
                                            setColumnVisibility({})
                                            setViewMode(disableResponsive ? "grid" : (window.innerWidth < 768 ? "card" : "grid"))
                                            table.setPageSize(hidePagination ? 10000 : 100)
                                            if (onSearch) onSearch("")
                                            else if (searchKey) table.getColumn(searchKey)?.setFilterValue("")
                                        }
                                    }}>
                                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>View</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setViewMode("grid")}>
                                        <List className="mr-2 h-4 w-4" />
                                        Grid View
                                        {viewMode === 'grid' && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setViewMode("card")}>
                                        <LayoutGrid className="mr-2 h-4 w-4" />
                                        Card View
                                        {viewMode === 'card' && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Settings2 className="mr-2 h-4 w-4" />
                                            Columns
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="w-[200px] max-h-[300px] overflow-y-auto">
                                            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {table
                                                .getAllColumns()
                                                .filter(
                                                    (column) =>
                                                        typeof column.accessorFn !== "undefined" && column.getCanHide()
                                                )
                                                .map((column) => {
                                                    return (
                                                        <DropdownMenuCheckboxItem
                                                            key={column.id}
                                                            className="capitalize"
                                                            checked={column.getIsVisible()}
                                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                        >
                                                            {column.id}
                                                        </DropdownMenuCheckboxItem>
                                                    )
                                                })}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-background shrink-0 ml-auto sm:ml-0 opacity-50 cursor-wait">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 overflow-auto">
                    {viewMode === "grid" ? (
                        <Table>
                            <TableHeader className="bg-primary/5 sticky top-0 z-20 shadow-sm backdrop-blur-sm">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <React.Fragment key={headerGroup.id}>
                                        <TableRow className="border-b border-primary/10 hover:bg-transparent">
                                            {headerGroup.headers.map((header) => {
                                                const isSorted = header.column.getIsSorted()
                                                return (
                                                    <TableHead
                                                        key={header.id}
                                                        className="text-black font-bold text-[11px] tracking-wider h-7 px-2 cursor-pointer select-none hover:bg-primary/10 transition-colors"
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                            {header.column.getCanSort() && (
                                                                <span className="shrink-0">
                                                                    {isSorted === "asc" ? (
                                                                        <ChevronUp className="h-3 w-3" />
                                                                    ) : isSorted === "desc" ? (
                                                                        <ChevronDown className="h-3 w-3" />
                                                                    ) : (
                                                                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableHead>
                                                )
                                            })}
                                        </TableRow>
                                        {/* Filter Row */}
                                        <TableRow className="bg-primary/[0.02] hover:bg-transparent border-b border-primary/5">
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={`${header.id}-filter`} className="p-1 h-auto border-r border-primary/5 last:border-r-0">
                                                    {header.column.getCanFilter() ? (
                                                        <Input
                                                            placeholder="Search..."
                                                            value={(header.column.getFilterValue() as string) ?? ""}
                                                            onChange={(event) =>
                                                                header.column.setFilterValue(event.target.value)
                                                            }
                                                            className="h-6 text-[11px] px-1 bg-background border-primary/10 focus-visible:ring-primary/20"
                                                        />
                                                    ) : null}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="border-b border-border hover:bg-muted/50 transition-colors"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="py-1 text-[11px] font-medium text-foreground px-2">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <Card key={row.id} className="shadow-sm hover:shadow-md transition-shadow relative">
                                        <CardContent className="p-3">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                                {row.getVisibleCells().map((cell, index) => {
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    const columnDef = cell.column.columnDef as any
                                                    const header = typeof columnDef.header === 'string' ? columnDef.header : cell.column.id

                                                    // Handle Actions (absolute position)
                                                    if (cell.column.id === 'actions') {
                                                        return (
                                                            <div key={cell.id} className="absolute top-3 right-3">
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </div>
                                                        )
                                                    }

                                                    // Primary Title Logic (First visible column that isn't Select)
                                                    // Assuming 'select' is excluded or index 0 is the meaningful ID.
                                                    if (index === 0) {
                                                        return (
                                                            <div key={cell.id} className="col-span-2 pr-10 border-b border-border pb-2 mb-1">
                                                                <div className="text-lg font-bold text-primary">
                                                                    {flexRender(
                                                                        cell.column.columnDef.cell,
                                                                        cell.getContext()
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground font-medium">
                                                                    {header}
                                                                </div>
                                                            </div>
                                                        )
                                                    }

                                                    // Determine span
                                                    const isFullWidth = ['description', 'address', 'toolname', 'itemname', 'clientname', 'suppliername', 'name'].includes(cell.column.id.toLowerCase()) || header.toLowerCase().includes('name') || header.toLowerCase().includes('description')

                                                    return (
                                                        <div
                                                            key={cell.id}
                                                            className={`flex flex-col gap-0.5 ${isFullWidth ? 'col-span-2' : 'col-span-1'}`}
                                                        >
                                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                                                {header}
                                                            </span>
                                                            <span className="text-sm font-medium text-foreground break-words">
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground">
                                    No results.
                                </div>
                            )}
                        </div>
                    )}

                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                <span className="text-xs font-medium text-primary">Loading Data...</span>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <span className="text-xs font-medium text-primary">Loading Data...</span>
                        </div>
                    </div>
                )}
            </div>

            {!hidePagination && (
                <div className="flex items-center justify-between px-2 flex-none py-2">
                    <div className="flex-1 text-sm text-muted-foreground hidden">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            {mounted && (
                                <Select
                                    value={`${table.getState().pagination.pageSize}`}
                                    onValueChange={(value) => {
                                        const newSize = Number(value)
                                        table.setPageSize(newSize)
                                        if (gridId) updatePageSize(newSize) // Sync page size change
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[100, 500, 1000].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
