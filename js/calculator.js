/*
  Arithmetic expression evaluator, ported 1:1 from the native app's
  data/ArithmeticEvaluator.kt -- same grammar, same precedence (including
  the "-2^2 is -4, not (-2)^2" convention), same recursive-descent
  structure. Not wired into a screen yet (the calculator drop-up itself
  hasn't been built for the web version), but kept here ready for when it
  is, rather than re-deriving the grammar from scratch later.
*/
window.BB = window.BB || {};
BB.calculator = (() => {
  class ArithmeticEvaluationException extends Error {}

  function tokenize(expression) {
    const tokens = [];
    let i = 0;
    while (i < expression.length) {
      const c = expression[i];
      if (/\s/.test(c)) {
        i++;
      } else if (c === "(") {
        tokens.push({ type: "lparen" });
        i++;
      } else if (c === ")") {
        tokens.push({ type: "rparen" });
        i++;
      } else if ("+-*/^".includes(c)) {
        tokens.push({ type: "op", symbol: c });
        i++;
      } else if (/[0-9.]/.test(c)) {
        const start = i;
        let sawDot = false;
        while (i < expression.length && (/[0-9]/.test(expression[i]) || (expression[i] === "." && !sawDot))) {
          if (expression[i] === ".") sawDot = true;
          i++;
        }
        const numberText = expression.slice(start, i);
        const value = Number(numberText);
        if (Number.isNaN(value)) throw new ArithmeticEvaluationException(`Invalid number "${numberText}"`);
        tokens.push({ type: "number", value });
      } else {
        throw new ArithmeticEvaluationException(`Unsupported character "${c}"`);
      }
    }
    return tokens;
  }

  /*
   * Weakest binding first:
   * expression  := term (('+' | '-') term)*
   * term        := signedPower (('*' | '/') signedPower)*
   * power       := primary ('^' signedPower)?   -- right-associative; the
   *                exponent itself may carry its own sign (e.g. `2^-1`)
   * signedPower := ('-' | '+') signedPower | power   -- unary binds looser
   *                than '^' at the base (`-2^2` is `-(2^2)`, i.e. -4, not
   *                (-2)^2 -- the usual calculator convention), but a sign
   *                directly on an exponent still applies to just that
   *                exponent
   * primary     := number | '(' expression ')'
   */
  class Parser {
    constructor(tokens) {
      this.tokens = tokens;
      this.pos = 0;
    }
    isAtEnd() {
      return this.pos >= this.tokens.length;
    }
    peek() {
      return this.tokens[this.pos] ?? null;
    }
    advance() {
      return this.tokens[this.pos++];
    }
    parseExpression() {
      let value = this.parseTerm();
      for (;;) {
        const op = this.peek();
        if (op && op.type === "op" && op.symbol === "+") {
          this.advance();
          value += this.parseTerm();
        } else if (op && op.type === "op" && op.symbol === "-") {
          this.advance();
          value -= this.parseTerm();
        } else {
          return value;
        }
      }
    }
    parseTerm() {
      let value = this.parseSignedPower();
      for (;;) {
        const op = this.peek();
        if (op && op.type === "op" && op.symbol === "*") {
          this.advance();
          value *= this.parseSignedPower();
        } else if (op && op.type === "op" && op.symbol === "/") {
          this.advance();
          const divisor = this.parseSignedPower();
          if (divisor === 0) throw new ArithmeticEvaluationException("Division by zero");
          value /= divisor;
        } else {
          return value;
        }
      }
    }
    parseSignedPower() {
      const op = this.peek();
      if (op && op.type === "op" && op.symbol === "-") {
        this.advance();
        return -this.parseSignedPower();
      }
      if (op && op.type === "op" && op.symbol === "+") {
        this.advance();
        return this.parseSignedPower();
      }
      return this.parsePower();
    }
    parsePower() {
      const base = this.parsePrimary();
      const op = this.peek();
      if (op && op.type === "op" && op.symbol === "^") {
        this.advance();
        return Math.pow(base, this.parseSignedPower());
      }
      return base;
    }
    parsePrimary() {
      const token = this.peek();
      if (token && token.type === "number") {
        this.advance();
        return token.value;
      }
      if (token && token.type === "lparen") {
        this.advance();
        const value = this.parseExpression();
        if (!this.peek() || this.peek().type !== "rparen") {
          throw new ArithmeticEvaluationException("Missing closing parenthesis");
        }
        this.advance();
        return value;
      }
      throw new ArithmeticEvaluationException('Expected a number or "("');
    }
  }

  function evaluate(expression) {
    const tokens = tokenize(expression);
    if (tokens.length === 0) throw new ArithmeticEvaluationException("Empty expression");
    const parser = new Parser(tokens);
    const result = parser.parseExpression();
    if (!parser.isAtEnd()) throw new ArithmeticEvaluationException("Unexpected trailing input");
    return result;
  }

  return { evaluate, ArithmeticEvaluationException };
})();
