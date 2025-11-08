import * as smd from "./smd.js"

function test_renderer() {
    const root = { type: smd.Token.Document, children: [] }
    return {
        add_token: (data, type) => {
            const node = {type, children: []}
            data.node.children.push(node)
            data.parent_map.set(node, data.node)
            data.node = node
            console.log(">>> add_token:", smd.token_to_string(type))
        },
        end_token: (data) => {
            const parent = data.parent_map.get(data.node)
            data.node = parent
            console.log(">>> end_token")
        },
        add_text: (data, text) => {
            if (typeof data.node.children[data.node.children.length - 1] === "string") {
                data.node.children[data.node.children.length - 1] += text
            } else {
                data.node.children.push(text)
            }
            console.log(">>> add_text:", JSON.stringify(text))
        },
        set_attr: (data, type, value) => {
            if (!data.node.attrs) data.node.attrs = {}
            data.node.attrs[type] = value
            console.log(">>> set_attr:", smd.attr_to_html_attr(type), "=", value)
        },
        data: { parent_map: new Map(), root, node: root }
    }
}

console.log("\n========================================")
console.log("Testing: ££example::https://example.com££")
console.log("========================================\n")

const renderer = test_renderer()
const parser = smd.parser(renderer)

const input = "££example::https://example.com££"
smd.parser_write(parser, input)
smd.parser_end(parser)

console.log("\n========================================")
console.log("Final tree:")
console.log("========================================")
console.log(JSON.stringify(renderer.data.root, null, 2))
