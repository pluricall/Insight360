import { TableLoadedContacts } from "./components/TableLoadedContacts";
import { TableSuccessTypeBd } from "./components/TableTypeBd";
import { FunnelChartComponent } from "./components/FunnelChart";

export default function FunnelPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 p-2 w-full">
      <TableLoadedContacts />
      <div className="flex flex-col gap-2">
      <TableSuccessTypeBd />
      <FunnelChartComponent />
      </div>
    </div>
  );
}
