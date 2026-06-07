"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export type SeriesType = {
  id: string;
  title: string;
  description?: string | null;
  genre?: string | null;
  status?: string | null;
  totalEpisodes?: number | null;
  isPremium?: boolean | null;
  defaultPricePerEpisode?: number | null;
  totalViewsCount?: number | null;
  coverImageId?: string | null;
};

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-white/40 hover:bg-white/10"
    >
      <IconGripVertical className="size-4" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<SeriesType>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-white/20 data-[state=checked]:bg-indigo-500"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-white/20 data-[state=checked]:bg-indigo-500"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "genre",
    header: "Genre",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-white/70 border-white/20">
          {row.original.genre || "Uncategorized"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-white/70 border-white/20">
        {row.original.status === "COMPLETED" ? (
          <IconCircleCheckFilled className="text-emerald-500 size-4 mr-1" />
        ) : (
          <IconLoader className="size-4 mr-1 animate-spin text-indigo-400" />
        )}
        {row.original.status || "ONGOING"}
      </Badge>
    ),
  },
  {
    accessorKey: "totalEpisodes",
    header: () => <div className="w-full text-right">Episodes</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.original.totalEpisodes || 0}</div>
    ),
  },
  {
    accessorKey: "isPremium",
    header: "Pricing",
    cell: ({ row }) => {
      if (row.original.isPremium) {
        return (
          <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md font-semibold whitespace-nowrap">
            Premium ({row.original.defaultPricePerEpisode}c)
          </span>
        )
      }
      return <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md font-semibold">Free</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions id={row.original.id} />,
  },
]

function RowActions({ id }: { id: string }) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-white/60 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-[#121212] text-white border-white/10">
        <DropdownMenuItem onClick={() => router.push(`/reels/studio/series/${id}/edit`)} className="focus:bg-white/10 focus:text-white cursor-pointer">Edit</DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer" onClick={() => {
          if(confirm("Are you sure you want to delete this series?")) {
            fetch(`/api/reels/series/${id}`, { method: "DELETE" }).then(() => {
              window.location.reload()
            })
          }
        }}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DraggableRow({ row }: { row: Row<SeriesType> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 bg-transparent hover:bg-white/5 border-white/10"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: SeriesType[]
}) {
  const [data, setData] = React.useState(initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6 text-white"
    >
      <div className="flex items-center justify-between px-2 mb-6">
        <TabsList className="hidden @4xl/main:flex bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="outline" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg">All Series</TabsTrigger>
          <TabsTrigger value="ongoing" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg">
            Ongoing <Badge variant="secondary" className="ml-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg">
            Completed <Badge variant="secondary" className="ml-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">2</Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Input
              placeholder="Filter series..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="w-[250px] bg-[#121212] border-white/10 text-white focus-visible:ring-indigo-500"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-[#121212] border-white/10 text-white hover:bg-white/10">
                <IconLayoutColumns className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Columns</span>
                <IconChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#121212] text-white border-white/10">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize focus:bg-white/10 focus:text-white"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/reels/studio/series/create">
            <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
              <IconPlus className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">New Series</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile Search */}
      <div className="md:hidden px-2 mb-4">
        <Input
          placeholder="Filter series..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="w-full bg-[#121212] border-white/10 text-white focus-visible:ring-indigo-500"
        />
      </div>

      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-2"
      >
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan} className="text-white/60">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-white/40"
                    >
                      No series found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="hidden flex-1 text-sm text-white/50 lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit text-white/80">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20 bg-[#121212] border-white/10" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top" className="bg-[#121212] text-white border-white/10">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="focus:bg-white/10 focus:text-white">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex bg-[#121212] border-white/10 text-white hover:bg-white/10"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 bg-[#121212] border-white/10 text-white hover:bg-white/10"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 bg-[#121212] border-white/10 text-white hover:bg-white/10"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex bg-[#121212] border-white/10 text-white hover:bg-white/10"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="ongoing"
        className="flex flex-col px-2"
      >
        <div className="aspect-video w-full flex-1 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/40 bg-[#121212]">Ongoing Series List</div>
      </TabsContent>
      <TabsContent value="completed" className="flex flex-col px-2">
        <div className="aspect-video w-full flex-1 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/40 bg-[#121212]">Completed Series List</div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = [
  { month: "January", views: 186, revenue: 80 },
  { month: "February", views: 305, revenue: 200 },
  { month: "March", views: 237, revenue: 120 },
  { month: "April", views: 73, revenue: 190 },
  { month: "May", views: 209, revenue: 130 },
  { month: "June", views: 214, revenue: 140 },
]

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--color-views)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--color-revenue)",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: SeriesType }) {
  const isMobile = useIsMobile()
  const router = useRouter()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-white font-semibold hover:text-indigo-400 transition-colors group">
          <div className="flex items-center gap-3">
            {item.coverImageId ? (
              <img src={`/api/images/${item.coverImageId}`} className="w-8 h-12 object-cover rounded shadow-sm" alt="" />
            ) : (
              <div className="w-8 h-12 bg-white/5 rounded flex items-center justify-center">
                <IconLoader className="w-4 h-4 text-white/20" />
              </div>
            )}
            <span className="truncate max-w-[200px]">{item.title}</span>
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-[#121212] text-white border-white/10 outline-none w-full md:w-[500px]">
        <DrawerHeader className="gap-1 border-b border-white/10 pb-4">
          <DrawerTitle className="text-xl flex items-center gap-3">
            {item.coverImageId && <img src={`/api/images/${item.coverImageId}`} className="w-12 h-16 object-cover rounded shadow-sm" alt="" />}
            <span className="line-clamp-2">{item.title}</span>
          </DrawerTitle>
          <DrawerDescription className="text-white/50">
            Overview and performance metrics
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-6 text-sm h-full">
          {!isMobile && (
            <div className="mb-4">
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="revenue"
                    type="natural"
                    fill="#6366f1"
                    fillOpacity={0.6}
                    stroke="#6366f1"
                    stackId="a"
                  />
                  <Area
                    dataKey="views"
                    type="natural"
                    fill="#eab308"
                    fillOpacity={0.4}
                    stroke="#eab308"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator className="bg-white/10 my-6" />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium text-emerald-400">
                  Trending up by 12.5% this month{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-white/50">
                  Total Views: {item.totalViewsCount?.toLocaleString() || 0}
                </div>
              </div>
              <Separator className="bg-white/10 my-6" />
            </div>
          )}
          
          <div className="space-y-6">
             <div>
                <Label className="text-white/70">Description</Label>
                <p className="text-white mt-1 text-base">{item.description || "No description provided."}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70">Genre</Label>
                  <div className="mt-1 font-semibold text-base">{item.genre || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-white/70">Status</Label>
                  <div className="mt-1 font-semibold text-base">{item.status || "ONGOING"}</div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70">Total Episodes</Label>
                  <div className="mt-1 font-semibold text-base">{item.totalEpisodes || 0}</div>
                </div>
                <div>
                  <Label className="text-white/70">Pricing</Label>
                  <div className="mt-1 font-semibold text-base">
                    {item.isPremium ? <span className="text-yellow-500">{item.defaultPricePerEpisode} Coins / ep</span> : <span className="text-emerald-500">Free Series</span>}
                  </div>
                </div>
             </div>
          </div>
        </div>
        <DrawerFooter className="border-t border-white/10 p-6 flex flex-row justify-end gap-3">
          <DrawerClose asChild>
            <Button variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/10">Close</Button>
          </DrawerClose>
          <Button onClick={() => router.push(`/reels/studio/series/${item.id}/edit`)} className="bg-indigo-600 hover:bg-indigo-500 text-white">Manage Episodes</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default function Page() {
  const [data, setData] = React.useState<SeriesType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/reels/series?limit=50");
        const json = await res.json();
        if(json.success) {
          setData(json.series);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Series Studio</h1>
            <p className="text-white/50 mt-2">Manage all your Mini-Dramas from this advanced dashboard.</p>
          </div>
        </header>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <IconLoader className="animate-spin text-indigo-500 w-8 h-8" />
          </div>
        ) : (
          <DataTable data={data} />
        )}
      </div>
    </div>
  );
}
