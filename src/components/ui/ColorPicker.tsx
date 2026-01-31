import { DESIGN_TOKENS } from '../../constants/design-tokens';

export interface ColorPickerProps {
    /** Currently selected color */
    value: string;

    /** Called when color is changed */
    onChange: (color: string) => void;

    /** Optional label for the picker */
    label?: string;
}

/**
 * ColorPicker component.
 * Displays a grid of tactical color swatches from DESIGN_TOKENS.
 */
export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
    // Flatten all team colors into a single palette
    const teamColors = [...DESIGN_TOKENS.colours.attack, ...DESIGN_TOKENS.colours.defense];
    const colorPalette = [
        ...teamColors,
        ...DESIGN_TOKENS.colours.neutral,
    ];

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {label}
                </label>
            )}
            <div className="grid grid-cols-6 gap-2">
                {colorPalette.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        className="w-8 h-8 border-2 transition-all hover:scale-110"
                        style={{
                            backgroundColor: color,
                            borderColor: value === color ? DESIGN_TOKENS.colours.primary : '#E5E7EB',
                            borderWidth: value === color ? '3px' : '1px',
                        }}
                        title={color}
                    />
                ))}
            </div>
        </div>
    );
}
