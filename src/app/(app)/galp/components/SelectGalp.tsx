import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  errors?: { message?: string };
  title?: string;
}

export const SelectGalp = ({ errors, title, ...props }: SelectProps) => {
  return (
    <div>
      {title && !errors?.message && (
        <label htmlFor={props.id} className="text-black font-medium text-md">
          {title}
        </label>
      )}
      {errors?.message && (
        <p className="text-red-600 text-md font-bold">{errors.message}</p>
      )}
      <select
        {...props}
        className="h-10 border p-2 text-zinc-700 border-zinc-700 rounded-xl w-full text-lg focus:outline-none focus:border-orange-600 focus:border-2"
      />
    </div>
  );
};
