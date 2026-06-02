import { SeatCell } from "./utils";


export async function getSeatTypes() {
  return fetch("/api/seats/types").then((r) => r.json())
}


export async function getScreen(screenId: string) {
    return fetch(`/api/cinema/screens/${screenId}`).then((r) => r.json())
}


export async function saveSeatMap(screenId: string, grid: SeatCell[][]) {
    return fetch(`/api/cinema/screens/${screenId}/seat-map`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            rows: grid.length,
            columns: grid[0].length,
            seatLayout: grid.map((row) =>
                row.map((cell) => ({
                    row: cell.row,
                    col: cell.col,
                    seatTypeId: cell.seatTypeId,
                    isAccessible: cell.isAccessible,
                })),
            ),
        }),
    }).then((r) => r.json())
}
    