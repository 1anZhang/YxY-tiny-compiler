### 可能是代码最少的编译器了，麻雀虽小，五脏俱全

### 能把(add 2 (subtract 4 2))转成add(2, subtract(4, 2))

### 完整的构建流程
1. input  => tokenizer   => tokens
2. tokens => parser      => ast
3. ast    => transformer => newAst
4. newAst => generator   => output

 copy from [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)