"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var acorn = require("acorn");
var test = require("tape");
var transform = require("./transform");
var createContext = function (source) {
    return {
        js: {
            ast: acorn.parse(source, { ecmaVersion: 6, sourceType: "module" })
        },
        log: {
            appenders: [{
                    layout: {
                        pattern: "%[%d{DATE}:%p [%c]: %]%m",
                        type: "pattern"
                    },
                    type: "console"
                }],
            level: "INFO"
        },
        module: "module",
        paths: {
            basepath: process.cwd(),
            filename: "file.js",
            urlroot: "/"
        },
        source: source
    };
};
test("transformer should check js property", function (t) {
    t.plan(1);
    var context = createContext("export * from './foo.js';");
    context.js = undefined;
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.false(dirty);
    });
});
test("transformer should detect es6 wildcard export", function (t) {
    t.plan(1);
    var context = createContext("export * from './foo.js';");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});
test("transformer should detect es6 default export", function (t) {
    t.plan(1);
    var context = createContext("export default function(){}");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});
test("transformer should detect es6 named export", function (t) {
    t.plan(1);
    var context = createContext("const x = 1; export { x };");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});
test("transformer should detect es6 import", function (t) {
    t.plan(1);
    var context = createContext("import foo from './bar.js';");
    transform()(context, function (error, dirty) {
        if (error) {
            t.fail();
        }
        t.assert(dirty);
    });
});
test("transformer should compile and set new source", function (t) {
    t.plan(1);
    var context = createContext("let x = 1; export default x");
    transform()(context, function () {
        t.equal(context.source, "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n" +
            "  value: true\n});\nvar x = 1;exports.default = x;");
    });
});
test("transformer should compile and set new ast", function (t) {
    t.plan(1);
    var context = createContext("export default function(){}");
    transform()(context, function () {
        t.equal(context.js.ast.body[0].type, "ExpressionStatement");
    });
});
test("transformer should use custom compiler options", function (t) {
    t.plan(1);
    var source = "let x = 2; x **= 3; export default x;";
    var context = {
        js: {
            ast: acorn.parse(source, { ecmaVersion: 7, sourceType: "module" })
        },
        log: {
            appenders: [{
                    layout: {
                        pattern: "%[%d{DATE}:%p [%c]: %]%m",
                        type: "pattern"
                    },
                    type: "console"
                }],
            level: "INFO"
        },
        module: "module",
        paths: {
            basepath: process.cwd(),
            filename: "file.js",
            urlroot: "/"
        },
        source: source
    };
    transform({ presets: ["es2016"] })(context, function () {
        t.equal(context.source, "let x = 2;x = Math.pow(x, 3);\nexport default x;");
    });
});