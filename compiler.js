/**
 * ==============================================================================
 *                               (๑•̀ㅂ•́)و✧
 *                              TOKENIZER!
 * The first phase of parsing, lexical analisis, with the tokenizer!
 * ==============================================================================
 */

function tokenizer(input) {
  let current = 0;
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    // parentheses ()
    if (char === '(') {
      tokens.push({
        type: 'paren',
        value: '(',
      });

      current++;
      continue;
    }

    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')',
      });

      current++;
      continue;
    }

    // white space
    let WHITE_SPACE = /\s/;
    if (WHITE_SPACE.test(char)) {
      current++;
      continue;
    }

    // number 8492
    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'number',
        value,
      });

      continue;
    }

    // string "str"
    if (char === '"') {
      let value = '';

      value = input[++current];

      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'string',
        value,
      });

      continue;
    }

    // name token
    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = '';

      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'name',
        value,
      });
      continue;
    }

    // finally, if we don't matched a character right now, we are going to throw an error
    // and exit this program
    throw new TypeError('We dont understand this character ' + char);
  }
  return tokens;
}

/**
 * ==============================================================================
 *                              ჰჰჰ❛‿❛ჴჴჴ
 *                              PARSER!!
 * For parser we're going to take our array of tokens and turn it into an AST!
 * ==============================================================================
 */

function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === 'number') {
      current++;
      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }

    if (token.type === 'string') {
      current++;
      return {
        type: 'StringLiteral',
        value: token.value,
      };
    }

    if (token.type === 'paren' && token.value === '(') {
      token = tokens[++current];

      // lisp语言特有的 ( name xx xx ) 左括号后会跟一个name token
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };

      // 这里跳过name token
      token = tokens[++current];

      while (
        token.type !== 'paren' ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;

      return node;
    }
    throw new TypeError('we cant understand the token type: ' + token.type);
  }

  let ast = {
    type: 'Program',
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

/**
 * ==============================================================================
 *                              ⌒(❀>◞౪◟<❀)⌒
 *                              TRAVERSER!!!
 * So now we have our AST, and we want to be able to visit different nodes with
 * a visitor. We need to be able to call the methods on the visitor whenever we
 * encounter a node with a matching type.
 * ==============================================================================
 */

function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    let method = visitor[node.type];

    if (method && method.enter) {
      method.enter(node, parent);
    }

    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;

      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      case 'StringLiteral':
      case 'NumberLiteral':
        break;

      default:
        throw new TypeError('we cant traverse this type: ' + node.type);
    }

    if (method && method.exit) {
      method.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

/**
 * ==============================================================================
 *                                ⁽(◍˃̵͈̑ᴗ˂̵͈̑)⁽
 *                              TRANSFORMER!!!!
 * Next up, the transformer. Our transformer is going to take the AST that we
 * have built and pass it to our traverser function with a visitor and will
 * create a new ast.
 * ==============================================================================
 */

function transformer(ast) {
  let newAst = {
    type: 'Program',
    body: [],
  };

  ast._context = newAst.body;
  traverser(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value,
        });
      },
    },
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value,
        });
      },
    },
    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };
        node._context = expression.arguments;

        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }
        parent._context.push(expression);
      },
    },
  });

  return newAst;
}

/**
 * ============================================================================
 *                               ヾ（〃＾∇＾）ﾉ♪
 *                            THE CODE GENERATOR!!!!
 * Our code generator is going to recursively call itself to print each node in
 * the tree into one giant string.
 * ============================================================================
 */

function codeGenerator(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('\n');

    case 'ExpressionStatement':
      return codeGenerator(node.expression) + ';';

    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator).join(', ') +
        ')'
      );

    case 'Identifier':
      return node.name;

    case 'NumberLiteral':
      return node.value;

    case 'StringLiteral':
      return '"' + node.value + '"';

    default:
      throw new TypeError('we cant generator this code type: ' + node.type);
  }
}

/**
 * ============================================================================
 *                                  (۶* ‘ヮ’)۶”
 *                         !!!!!!!!THE COMPILER!!!!!!!!
 * ============================================================================
 */

/**
 * FINALLY! We'll create our `compiler` function. Here we will link together
 * every part of the pipeline.
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */

function compiler(input) {
  let tokens = tokenizer(input);
  let ast = parser(tokens);
  let newAst = transformer(ast);
  let output = codeGenerator(newAst);

  // and simply return the output!
  return output;
}

/**
 * ============================================================================
 *                                   (๑˃̵ᴗ˂̵)و
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!YOU MADE IT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * ============================================================================
 */

module.exports = {
  tokenizer,
  parser,
  traverser,
  transformer,
  codeGenerator,
  compiler,
};
