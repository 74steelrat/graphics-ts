import type { SceneNode } from './Types';
import * as Renderer2D from './Renderer2D';

export type T = {
  add(node: SceneNode): void;
  remove(node: SceneNode): void;

  attach(renderer: Renderer2D.T): void;
  detach(): void;

  update(deltaTime: number): void;
  render(renderer: Renderer2D.T): void;
};

export const create = (): T => {
  let nodes: SceneNode[] = [];
  let renderer: Renderer2D.T | null = null;

  const add = (node: SceneNode) => {
    nodes.push(node);
    if (renderer) node.onAttach(renderer);
  };

  const remove = (node: SceneNode) => {
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

  return { add, remove, attach, detach, update, render };
};
