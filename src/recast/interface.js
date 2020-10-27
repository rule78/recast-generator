import { parse, prettyPrint } from "recast";
import {
  visit as v,
  namedTypes as n,
  builders as t,
} from "ast-types";

const Order = {
    properties: {
        id: { type: "integer", format: "int64" },
        complete: { type: "boolean" },
        status: {
            description: "Order Status",
            enum: ["placed", "approved", "delivered"],
            type: "string",
        }
    }
}

const formatDef = (def) => {
    const definitions = [];
    Object.keys(def.properties).forEach(i => {
        if (i.enum) {
            definitions.push({
                name: `Order${i}`,
                type: 'enum'
            })
        }
    })
}

const generator = (source, def) => {
    const ast = parse(source, {
      sourceType: "module",
      plugins: ["flowComments"]
    });
    v(ast, {
        visitProgram(path) {
            path.get("body").push(

            )
        }
    })
}