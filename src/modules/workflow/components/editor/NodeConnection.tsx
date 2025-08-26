// 🟢 WORKING: Node connection component for visual workflow relationships
import { memo, useMemo } from 'react';
import type { EditorConnection, EditorPosition } from '../../context/WorkflowEditorContext';

interface NodeConnectionProps {
  connection: EditorConnection;
  sourcePosition: EditorPosition;
  targetPosition: EditorPosition;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

// Calculate bezier curve control points for smooth connections
function calculateBezierPath(
  source: EditorPosition, 
  target: EditorPosition, 
  connectionType: 'dependency' | 'flow'
): string {
  const dx = target.x - source.x;
  
  // Control points for different connection types
  let controlOffset: number;
  if (connectionType === 'dependency') {
    controlOffset = Math.abs(dx) * 0.5; // More curved for dependencies
  } else {
    controlOffset = Math.abs(dx) * 0.3; // Less curved for flow connections
  }
  
  const cp1x = source.x + Math.min(controlOffset, 100);
  const cp1y = source.y;
  const cp2x = target.x - Math.min(controlOffset, 100);
  const cp2y = target.y;

  return `M ${source.x},${source.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${target.x},${target.y}`;
}

// Get connection styling based on type
function getConnectionStyle(type: 'dependency' | 'flow', isSelected: boolean = false) {
  const baseStyle = {
    stroke: isSelected ? '#3B82F6' : '#6B7280', // Blue when selected, gray otherwise
    strokeWidth: isSelected ? 2.5 : 2,
    fill: 'none',
    opacity: isSelected ? 1 : 0.8
  };

  if (type === 'dependency') {
    return {
      ...baseStyle,
      strokeDasharray: '5,5', // Dashed line for dependencies
      stroke: isSelected ? '#EF4444' : '#DC2626' // Red for dependencies
    };
  }

  return baseStyle; // Solid line for flow connections
}

// Arrow marker component
const ArrowMarker = memo(({ id, color = '#6B7280' }: { id: string; color?: string }) => (
  <defs>
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="3"
      markerWidth="6"
      markerHeight="6"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path
        d="M0,0 L0,6 L9,3 z"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
    </marker>
  </defs>
));

ArrowMarker.displayName = 'ArrowMarker';

export const NodeConnection = memo(({
  connection,
  sourcePosition,
  targetPosition,
  isSelected = false,
  onSelect,
  onDelete
}: NodeConnectionProps) => {
  
  // Calculate the path for the connection
  const path = useMemo(() => {
    return calculateBezierPath(sourcePosition, targetPosition, connection.type);
  }, [sourcePosition, targetPosition, connection.type]);

  // Get styling for the connection
  const style = useMemo(() => {
    return getConnectionStyle(connection.type, isSelected);
  }, [connection.type, isSelected]);

  // Calculate midpoint for labels and interaction
  const midpoint = useMemo(() => {
    return {
      x: (sourcePosition.x + targetPosition.x) / 2,
      y: (sourcePosition.y + targetPosition.y) / 2
    };
  }, [sourcePosition, targetPosition]);

  // Connection labels
  const ConnectionLabel = useMemo(() => {
    if (connection.type === 'dependency') {
      return (
        <g>
          <circle
            cx={midpoint.x}
            cy={midpoint.y}
            r="8"
            fill="white"
            stroke={style.stroke}
            strokeWidth="1.5"
            className="cursor-pointer hover:r-10 transition-all"
          />
          <text
            x={midpoint.x}
            y={midpoint.y + 1}
            textAnchor="middle"
            className="text-xs font-bold pointer-events-none"
            fill={style.stroke}
          >
            D
          </text>
        </g>
      );
    }
    return null;
  }, [connection.type, midpoint, style.stroke]);

  // Arrow marker ID
  const markerId = `arrow-${connection.id}`;
  const markerColor = connection.type === 'dependency' ? '#DC2626' : '#6B7280';

  return (
    <g className="workflow-connection">
      {/* Arrow marker definition */}
      <ArrowMarker id={markerId} color={markerColor} />
      
      {/* Invisible thick line for easier interaction */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="10"
        fill="none"
        className="cursor-pointer"
        onClick={onSelect}
        onDoubleClick={onDelete}
      />
      
      {/* Visible connection line */}
      <path
        d={path}
        {...style}
        markerEnd={`url(#${markerId})`}
        className="pointer-events-none transition-all duration-200"
      />
      
      {/* Connection label */}
      {ConnectionLabel}
      
      {/* Selection highlight */}
      {isSelected && (
        <>
          <path
            d={path}
            stroke="#3B82F6"
            strokeWidth="4"
            fill="none"
            opacity="0.3"
            className="pointer-events-none animate-pulse"
          />
          
          {/* Delete button when selected */}
          <g>
            <circle
              cx={midpoint.x + 20}
              cy={midpoint.y - 20}
              r="8"
              fill="#EF4444"
              className="cursor-pointer hover:r-9 transition-all"
              onClick={onDelete}
            />
            <text
              x={midpoint.x + 20}
              y={midpoint.y - 16}
              textAnchor="middle"
              className="text-xs font-bold text-white pointer-events-none"
            >
              ×
            </text>
          </g>
        </>
      )}
      
      {/* Connection type indicator */}
      {connection.type === 'dependency' && (
        <title>
          Dependency Connection - This node depends on the source node
        </title>
      )}
      {connection.type === 'flow' && (
        <title>
          Flow Connection - Sequential workflow progression
        </title>
      )}
    </g>
  );
});

NodeConnection.displayName = 'NodeConnection';

export default NodeConnection;