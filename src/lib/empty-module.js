// Stand-in for the Node-only 'canvas' package that konva's Node entry requires.
// next.config.js aliases 'canvas' to this file (the former webpack canvas: false).
const empty = {};
export default empty;
