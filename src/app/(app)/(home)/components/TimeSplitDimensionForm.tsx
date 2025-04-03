import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

interface TimeSplitDimensionFormProps {
  register: any;
  setValue: any;
  defaultTimeSplit?: string;
}

export function TimeSplitDimensionForm({
  register,
  setValue,
  defaultTimeSplit = "QuarterHour",
}: TimeSplitDimensionFormProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div>
        <Label htmlFor="timeSplitDimension">Time Split Dimension:</Label>
        <Select
          onValueChange={(value) => setValue("timeSplitDimension", value)}
          defaultValue={defaultTimeSplit}
        >
          <SelectTrigger id="timeSplitDimension" className="w-full">
            <SelectValue placeholder="Select a time split" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="QuarterHour">QuarterHour</SelectItem>
            <SelectItem value="Hour">Hour</SelectItem>
            <SelectItem value="Day">Day</SelectItem>
            <SelectItem value="Month">Month</SelectItem>
            <SelectItem value="Year">Year</SelectItem>
            <SelectItem value="Life">Life</SelectItem>     
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="startGmtMoment">Start GMT Moment:</Label>
        <Input
          type="datetime-local"
          id="startGmtMoment"
          {...register("startGmtMoment")}
        />
      </div>
      <div>
        <Label htmlFor="endGmtMoment">End GMT Moment:</Label>
        <Input
          type="datetime-local"
          id="endGmtMoment"
          {...register("endGmtMoment")}
        />
      </div>
    </div>
  );
}