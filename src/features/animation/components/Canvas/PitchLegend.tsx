import React from 'react';
import { Layer, Rect, Text, Group } from 'react-konva';
import { EntityColors } from '../../services/entityColors';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';

export interface PitchLegendProps {
  height: number;
}

export const PitchLegend: React.FC<PitchLegendProps> = ({ height }) => {
  const attackColor = EntityColors.getDefault('player', 'attack');
  const defenseColor = EntityColors.getDefault('player', 'defense');

  return (
    <Layer listening={false}>
      <Group x={16} y={height - 52}>
        {/* Attack Row */}
        <Group y={0}>
          <Rect width={12} height={12} fill={attackColor} cornerRadius={2} />
          <Text
            x={20}
            y={0}
            text="Attack"
            fontSize={12}
            fontFamily={DESIGN_TOKENS.typography.fontBody}
            fill="#FFFFFF"
            verticalAlign="middle"
            height={12}
          />
        </Group>
        
        {/* Defense Row */}
        <Group y={20}>
          <Rect width={12} height={12} fill={defenseColor} cornerRadius={2} />
          <Text
            x={20}
            y={0}
            text="Defence"
            fontSize={12}
            fontFamily={DESIGN_TOKENS.typography.fontBody}
            fill="#FFFFFF"
            verticalAlign="middle"
            height={12}
          />
        </Group>
      </Group>
    </Layer>
  );
};
