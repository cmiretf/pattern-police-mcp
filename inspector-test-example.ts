// Este archivo contiene ejemplos de violaciones para probar con MCP Inspector

// ❌ NAMING VIOLATIONS
const bad_snake_case = 1;  // debería ser camelCase
function Bad_Function_Name() {}  // debería ser camelCase
class myBadClassName {}  // debería ser PascalCase

// ✅ NAMING CORRECT
const goodCamelCase = 2;
const GOOD_CONSTANT = 42;
function goodFunctionName() {}
class GoodClassName {}

// ❌ SOLID VIOLATIONS: Too many parameters (>5)
function tooManyParameters(a, b, c, d, e, f, g, h) {
  return a + b + c + d + e + f + g + h;
}

// ❌ SOLID VIOLATIONS: God Class (>10 methods)
class GodClass {
  method1() {}
  method2() {}
  method3() {}
  method4() {}
  method5() {}
  method6() {}
  method7() {}
  method8() {}
  method9() {}
  method10() {}
  method11() {}  // Esta es la que excede el límite
  method12() {}
}

// ❌ CODE SMELLS: Unused variables
const unusedVariable = "never used";
const anotherUnused = 123;

// ✅ Used variable
const usedVariable = "this is used";
console.log(usedVariable);

// ❌ CODE SMELLS: Duplicated strings
const duplicate1 = "This is a duplicated string that appears multiple times";
const duplicate2 = "This is a duplicated string that appears multiple times";
const duplicate3 = "This is a duplicated string that appears multiple times";

// ❌ SOLID VIOLATIONS: Long method (>50 lines)
function veryLongMethod() {
  const line1 = 1;
  const line2 = 2;
  const line3 = 3;
  const line4 = 4;
  const line5 = 5;
  const line6 = 6;
  const line7 = 7;
  const line8 = 8;
  const line9 = 9;
  const line10 = 10;
  const line11 = 11;
  const line12 = 12;
  const line13 = 13;
  const line14 = 14;
  const line15 = 15;
  const line16 = 16;
  const line17 = 17;
  const line18 = 18;
  const line19 = 19;
  const line20 = 20;
  const line21 = 21;
  const line22 = 22;
  const line23 = 23;
  const line24 = 24;
  const line25 = 25;
  const line26 = 26;
  const line27 = 27;
  const line28 = 28;
  const line29 = 29;
  const line30 = 30;
  const line31 = 31;
  const line32 = 32;
  const line33 = 33;
  const line34 = 34;
  const line35 = 35;
  const line36 = 36;
  const line37 = 37;
  const line38 = 38;
  const line39 = 39;
  const line40 = 40;
  const line41 = 41;
  const line42 = 42;
  const line43 = 43;
  const line44 = 44;
  const line45 = 45;
  const line46 = 46;
  const line47 = 47;
  const line48 = 48;
  const line49 = 49;
  const line50 = 50;
  const line51 = 51;  // Esta línea excede el límite de 50
  return line51;
}

// Resumen de violaciones esperadas:
// - 3 naming violations (bad_snake_case, Bad_Function_Name, myBadClassName)
// - 1 too many parameters (tooManyParameters)
// - 1 god class (GodClass con 12 métodos)
// - 2 unused variables (unusedVariable, anotherUnused)
// - 1 long method (veryLongMethod con >50 líneas)
// - Posible duplicación de strings
