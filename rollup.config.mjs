import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const external = [
  "ar-gql",
  "dotenv",
  "json2csv",
  "nodemailer",
  "prettier",
  "body-parser",
  "cors",
  "express",
  "multer",
];

const plugins = [
  commonjs(),
  typescript({
    declaration: false,
  }),
  terser(),
];

const inputs = {
  index: "src/index.ts",
};

export default {
  input: inputs,
  output: [
    {
      dir: "dist",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].js",
    },
    {
      dir: "dist",
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].mjs",
    },
  ],
  plugins,
  external,
};
