import * as smd from "./smd.js"
import { JSDOM } from "jsdom"

// Create a DOM environment
const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="output"></div></body></html>`)
global.document = dom.window.document

console.log("\n========================================")
console.log("Testing HTML rendering of custom element")
console.log("========================================\n")

const output = document.getElementById('output')
const renderer = smd.default_renderer(output)
const parser = smd.parser(renderer)

const input = "Test ££example::https://example.com££ text"
console.log("Input:", input)

smd.parser_write(parser, input)
smd.parser_end(parser)

console.log("\n--- HTML Output ---")
console.log(output.innerHTML)

console.log("\n--- Checking for custom span ---")
const customSpans = output.querySelectorAll('.my-custom-span')
console.log("Found", customSpans.length, "custom span(s)")
customSpans.forEach((span, i) => {
    console.log(`Span ${i}:`)
    console.log("  - class:", span.className)
    console.log("  - data-name:", span.getAttribute('data-name'))
    console.log("  - href:", span.getAttribute('href'))
    console.log("  - innerHTML:", span.innerHTML)
})
