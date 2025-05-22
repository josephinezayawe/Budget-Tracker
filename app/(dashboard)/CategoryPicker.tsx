"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "@/lib/generated/prisma";
import { TransactionType } from "@/lib/type";

import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect } from "react";
import CreateCategoryDialog from "./_components/CreateCategoryDialog";
import { CommandEmpty } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
interface Props {
  type: TransactionType;
  onChange: (value: string) => void;
}

function CategoryPicker({ type, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if (!value) return;
    onChange(value); //whaen the value changes call the onchange callback
  }, [onChange, value]);

  const categoryQuery = useQuery({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  });
  const selectedCategory = categoryQuery.data?.find(
    (category: Category) => category.name === value
  );
  const SuccessCallback = useCallback(
    (category: Category) => {
      setValue(category.name);
      setOpen((prev) => !prev);
    },
    [setValue, setOpen]
  );

  if (categoryQuery.isLoading) {
    return <div>Loading categories...</div>;
  }

  if (categoryQuery.isError) {
    return <div>Error loading categories</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedCategory ? (
            <CategoryRow category={selectedCategory} />
          ) : (
            "select category"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CommandInput placeholder="search category..." />
          <CreateCategoryDialog type={type} SuccessCallback={SuccessCallback} />
          <CommandEmpty>
            <p>Category not found</p>
            <p className="text-xs text-muted foreground">
              Tip create a new category
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {categoryQuery.data &&
                categoryQuery.data.map((category: Category) => (
                  <CommandItem
                    key={category.name}
                    onSelect={() => {
                      setValue(category.name);
                      setOpen((prev) => !prev);
                    }}
                  >
                    <CategoryRow category={category} />
                    <Check
                      className={cn(
                        "mt-2 w-3 h-4 opacity-0",
                        value === category.name && "opacity-100"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2 ">
      <span role="img">{category.icon}</span>
      <span>{category.name}</span>
    </div>
  );
}

export default CategoryPicker;
