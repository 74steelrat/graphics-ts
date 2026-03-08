import type { Enableable } from './Types';
import * as Renderer2D from './Renderer2D';

/**
 * Renderable and updatable unit inside a Scene.
 */
export interface Node {
  /** Called when node is attached to a renderer. */
  onAttach(renderer: Renderer2D.T): void;

  /** Called when node is detached. */
  onDetach(): void;

  /** Called every frame before rendering. */
  onUpdate(deltaTime: number): void;

  /** Called every frame during render phase. */
  onRender(renderer: Renderer2D.T): void;
}

/**
 * Node with enable/disable capability.
 */
export type InteractiveNode = Node & Enableable;

/**
 * Scene manages lifecycle of nodes.
 */
export type T = {
  add(node: Node): void;
  remove(node: Node): void;

  attach(renderer: Renderer2D.T): void;
  detach(): void;

  update(deltaTime: number): void;
  render(renderer: Renderer2D.T): void;

  enable(): void;
  disable(): void;
};

/**
 * Creates a new Scene instance.
 */
export const create = (): T => {
  let nodes: Node[] = [];
  let renderer: Renderer2D.T | null = null;

  const add = (node: Node) => {
    nodes.push(node);
    if (renderer) node.onAttach(renderer);
  };

  const remove = (node: Node) => {
    nodes = nodes.filter((n) => n !== node);
    node.onDetach();
  };

  const attach = (r: Renderer2D.T) => {
    renderer = r;
    nodes.forEach((n) => n.onAttach(r));
  };

  const detach = () => {
    nodes.forEach((n) => n.onDetach());
    renderer = null;
  };

  const update = (delta: number) => {
    nodes.forEach((n) => n.onUpdate(delta));
  };

  const render = (r: Renderer2D.T) => {
    nodes.forEach((n) => n.onRender(r));
  };

  /**
   * Enable all interactive nodes.
   */
  const enable = () => {
    nodes.forEach((node) => {
      if (isInteractiveNode(node)) {
        node.enable();
      }
    });
  };

  /**
   * Disable all interactive nodes.
   */
  const disable = () => {
    nodes.forEach((node) => {
      if (isInteractiveNode(node)) {
        node.disable();
      }
    });
  };

  return { add, remove, attach, detach, update, render, enable, disable };
};

/**
 * Runtime type guard that checks if a Node is Interactive.
 */
export const isInteractiveNode = (
  node: Node | InteractiveNode
): node is InteractiveNode => {
  return (
    typeof (node as InteractiveNode).enable === 'function' &&
    typeof (node as InteractiveNode).disable === 'function'
  );
};
