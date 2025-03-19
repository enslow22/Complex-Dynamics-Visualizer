import { parse, ConstantNode, OperatorNode, FunctionNode, SymbolNode } from 'mathjs';

const mapper = [
  {type: 'OperatorNode', fn: 'multiply', replace: 'cmul'},
  {type: 'OperatorNode', fn: 'divide', replace: 'cdiv'},
  {type: 'OperatorNode', fn: 'sin', replace: 'csin'},
  {type: 'OperatorNode', fn: 'cos', replace: 'ccos'},
  {type: 'OperatorNode', fn: 'tan', replace: 'ctan'},
]

const protectedNames = ['c', 'z', 'i', 'abs', 'sin', 'cos', 'tan'];

// ty https://github.com/josdejong/mathjs/issues/939
function transformDepthFirst(node: Node, callback: Function) {
  // first process childs (depth first)
  var nodeWithUpdatedChilds = node.map(child => transformDepthFirst(child, callback));

  // then process the node itself
  return callback(nodeWithUpdatedChilds);
}

function t (node: Node, path: string, parent: Node) {

  /** 
  if (node.type === 'ConstantNode') {
    return new ConstantNode(node.value.toFixed(8));
  }*/

  if (node.type === 'SymbolNode') {
    if (node.name === 'c' || node.name === 'z') {
      return node
    }
    if (node.name === 'i') {
      return new SymbolNode("vec2(0, 1)");
    }
  }
  
  const m = mapper.find((m) => m.type === node.type && m.fn === node.fn);
  if (m) {
    console.log(node.fn);
    // replace the function name
    return new FunctionNode(m.replace, node.args);
  }

  if (node.type === 'OperatorNode') {
    if (node.fn === 'pow' && node.args[1].type === 'ConstantNode' && Number.isInteger(node.args[1].value)) {
      return new FunctionNode('cpowi', [node.args[0], node.args[1]]);
    }
  }
  return node;
}

function formatConstants(node: Node) {
  if (node.type === 'ConstantNode') {
    return new ConstantNode(node.value.toFixed(8));
  }
  return node;
}


export const parseExpression = (expression: string, uniformList: { variable: string; value: number }[]) => {
  try {
    const node = parse(expression);
    let c = node.transform(function formatUniforms(node: Node, path, parent) {
      if (node.type === 'SymbolNode' && !protectedNames.includes(node.name)) {
        return new SymbolNode(`iFloat${uniformList.findIndex((u) => u.variable === node.name)}`);
      }
      return node;
    })

    let a = transformDepthFirst(c, t);
    let b = parse(a.toString()).transform(formatConstants);
    

    return b.toString().replace(/"/g, '');
  } catch (e) {
    return null;
  }
};