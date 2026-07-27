import { ScrollArea } from '@expcat/tigercat-react/ScrollArea'

const rows = Array.from({ length: 12 }, (_, row) => ({
  key: `第 ${row + 1} 行`,
  cells: Array.from({ length: 10 }, (_, col) => `R${row + 1}C${col + 1}`)
}))

export default function App() {
  return (
    <div className="w-full max-w-md">
      <ScrollArea
        direction="both"
        scrollbar="always"
        scrollbarSize="lg"
        maxHeight={200}
        ariaLabel="双向滚动表格"
        className="rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="text-sm text-gray-700 dark:text-gray-200">
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">{row.key}</th>
                {row.cells.map((cell) => (
                  <td key={cell} className="whitespace-nowrap px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  )
}
