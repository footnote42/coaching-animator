import { SportType } from '../../types';
import { FIELD_DIMENSIONS } from '../../constants/fields';

export interface SportSelectorProps {
    /** Currently selected sport */
    currentSport: SportType;

    /** Called when sport selection changes */
    onSportChange: (sport: SportType) => void;
}

/**
 * Sport selector component for choosing field type.
 * Uses Constitution-compliant styling: sharp corners, monospace font, pitch green accents.
 */
export function SportSelector({ currentSport, onSportChange }: SportSelectorProps) {
    const sportOptions: SportType[] = ['rugby-union', 'rugby-league', 'soccer', 'american-football'];

    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor="sport-selector"
                className="text-sm font-semibold text-pitch-green"
            >
                Field Type
            </label>
            <select
                id="sport-selector"
                value={currentSport}
                onChange={(e) => onSportChange(e.target.value as SportType)}
                className="w-full px-3 py-2 bg-white border border-pitch-green font-mono text-sm text-pitch-green focus:outline-none focus:ring-1 focus:ring-pitch-green"
                style={{ borderRadius: 0 }} // Sharp corners (Constitution compliance)
            >
                {sportOptions.map((sport) => (
                    <option key={sport} value={sport}>
                        {FIELD_DIMENSIONS[sport].name}
                    </option>
                ))}
            </select>
        </div>
    );
}
