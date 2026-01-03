"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
    label: string
    value: string
}

interface CreatableComboboxProps {
    options: Option[]
    value?: string
    onSelect: (value: string) => void
    onCreate?: (value: string) => void
    placeholder?: string
    emptyText?: string
    className?: string
}

export function CreatableCombobox({
    options,
    value,
    onSelect,
    onCreate,
    placeholder = "Select option...",
    emptyText = "No option found.",
    className,
}: CreatableComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const selectedLabel = value
        ? options.find((option) => option.value === value)?.label
        : placeholder

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal text-left", !value && "text-muted-foreground", className)}
                >
                    {value ? options.find((option) => option.value === value)?.label || value : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} onValueChange={setInputValue} />
                    <CommandList>
                        <CommandEmpty className="py-2 px-2">
                            <p className="text-sm text-muted-foreground mb-2 px-2">{emptyText}</p>
                            {onCreate && inputValue && (
                                <Button
                                    variant="secondary"
                                    className="w-full justify-start h-8 text-xs"
                                    onClick={() => {
                                        onCreate(inputValue)
                                        setOpen(false)
                                        setInputValue("")
                                    }}
                                >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Create "{inputValue}"
                                </Button>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={(currentValue) => {
                                        // CommandItem returns the label (value prop here is often used for filtering), 
                                        // but we want the original value. 
                                        // However, cmdk matches by value (content).
                                        // We need to find the option that matches this label/value.
                                        const matchedOption = options.find(o => o.label.toLowerCase() === currentValue.toLowerCase()) || option
                                        onSelect(matchedOption.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
