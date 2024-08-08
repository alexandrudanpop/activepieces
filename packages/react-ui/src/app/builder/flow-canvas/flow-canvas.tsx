import Dagre from '@dagrejs/dagre';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
  NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useBuilderStateContext } from '../builder-hooks';
import { DataSelector } from '../data-selector/data-selector';

import { ApEdge, ApNode, flowCanvasUtils } from './flow-canvas-utils';
import { FlowDragLayer } from './flow-drag-layer';
import { ApEdgeWithButton } from './left-to-right/edge-with-button';
import { ReturnLoopedgeButton } from './left-to-right/return-loop-edge';
import { ApStepNode } from './left-to-right/step-node';
import { ApBigButton } from './nodes/big-button';
import { LoopStepPlaceHolder } from './nodes/loop-step-placeholder';
import { StepPlaceHolder } from './nodes/step-holder-placeholder';
import { TestFlowWidget } from './test-flow-widget';

function useContainerSize(
  setSize: (size: { width: number; height: number }) => void,
  containerRef: React.RefObject<HTMLDivElement>,
) {
  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, setSize]);
}

const getLayoutedElements = (nodes, edges, options) => {
  const NODE_SIZE = { width: 150, height: 150 }; // { width: 300, height: 300 };
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  console.log('options', options);
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: NODE_SIZE.width,
      height: NODE_SIZE.height,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? NODE_SIZE.width) / 2;
      const y = position.y - (node.measured?.height ?? NODE_SIZE.height) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const FlowCanvas = React.memo(() => {
  // const { fitView } = useReactFlow();
  const [allowCanvasPanning, flowVersion] = useBuilderStateContext((state) => [
    state.allowCanvasPanning,
    state.flowVersion,
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const graph = useMemo(() => {
    const intialGraph = flowCanvasUtils.convertFlowVersionToGraph(flowVersion);
    return getLayoutedElements(intialGraph.nodes, intialGraph.edges, {
      direction: 'LR',
    });
  }, [flowVersion]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  console.log('graph', graph);
  useContainerSize(setSize, containerRef);

  const nodeTypes = useMemo(
    () => ({
      stepNode: ApStepNode,
      placeholder: StepPlaceHolder,
      bigButton: ApBigButton,
      loopPlaceholder: LoopStepPlaceHolder,
    }),
    [],
  );
  const edgeTypes = useMemo(
    () => ({ apEdge: ApEdgeWithButton, apReturnEdge: ReturnLoopedgeButton }),
    [],
  );

  const [nodes, setNodes] = useState(graph.nodes);
  const [edges, setEdges] = useState(graph.edges);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph]);

  const onNodesChange = useCallback(
    (changes: NodeChange<ApNode>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<ApEdge>[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  // useEffect(() => {
  //   window.requestAnimationFrame(() => {
  //     fitView();
  //   });
  // }, [graph]);

  return (
    <div className="size-full grow relative" ref={containerRef}>
      <FlowDragLayer>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          draggable={false}
          onEdgesChange={onEdgesChange}
          maxZoom={1.5}
          minZoom={0.5}
          panOnDrag={allowCanvasPanning}
          zoomOnDoubleClick={false}
          panOnScroll={true}
          fitView={true}
          nodesConnectable={false}
          elementsSelectable={true}
          nodesDraggable={false}
          fitViewOptions={{
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.2,
            nodes: nodes.slice(0, 5),
            duration: 0,
          }}
        >
          <TestFlowWidget></TestFlowWidget>
          <Background />
          <Controls showInteractive={false} orientation="vertical" />
        </ReactFlow>
      </FlowDragLayer>
      <DataSelector
        parentHeight={size.height}
        parentWidth={size.width}
      ></DataSelector>
    </div>
  );
});
FlowCanvas.displayName = 'FlowCanvas';
export { FlowCanvas };
