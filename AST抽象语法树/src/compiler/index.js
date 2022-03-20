import {
  parseHtmlToAst
} from './astParser';
import {
  generate
} from './generate';

// 将html字符串变成render函数
function compileToRenderFunction(html) {
  const ast = parseHtmlToAst(html),
    code = generate(ast),

    render = new Function(`
          with(this){ return ${code} }
        `);
  console.log(ast);

  return render;
}

export {
  compileToRenderFunction
}