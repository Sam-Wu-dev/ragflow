import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from 'reactflow';
import useGraphStore from '../../store';

import { IFlow } from '@/interfaces/database/flow';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import styles from './index.less';

export function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const deleteEdgeById = useGraphStore((state) => state.deleteEdgeById);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const selectedStyle = useMemo(() => {
    return selected ? { strokeWidth: 2, stroke: '#1677ff' } : {};
  }, [selected]);

  const onEdgeClick = () => {
    deleteEdgeById(id);
  };

  // highlight the nodes that the workflow passes through
  const queryClient = useQueryClient();
  const flowDetail = queryClient.getQueryData<IFlow>(['flowDetail']);

  const graphPath = useMemo(() => {
    // TODO: this will be called multiple times
    const path = flowDetail?.dsl.path ?? [];
    // The second to last
    const previousGraphPath: string[] = path.at(-2) ?? [];
    let graphPath: string[] = path.at(-1) ?? [];
    // The last of the second to last article
    const previousLatestElement = previousGraphPath.at(-1);
    if (previousGraphPath.length > 0 && previousLatestElement) {
      graphPath = [previousLatestElement, ...graphPath];
    }
    return graphPath;
  }, [flowDetail?.dsl.path]);

  const highlightStyle = useMemo(() => {
    const idx = graphPath.findIndex((x) => x === source);
    if (idx !== -1 && graphPath[idx + 1] === target) {
      return { strokeWidth: 2, stroke: 'red' };
    }
    return {};
  }, [source, target, graphPath]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, ...selectedStyle, ...highlightStyle }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className={styles.edgeButton}
            type="button"
            onClick={onEdgeClick}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
