import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export const testEnvironment = "node";
export const transform = {
  ...tsJestTransformCfg,
};

// import { createDefaultPreset } from "ts-jest";

// const tsJestTransformCfg = createDefaultPreset().transform;

// /** @type {import("jest").Config} **/
// export const testEnvironment = "node";
// export const transform = {
//   "^.+\\.ts$": ["ts-jest", {
//     tsconfig: "tsconfig.json",
//     isolatedModules: true
//   }],
// };
// export const moduleFileExtensions = ["ts", "js"];
// export const clearMocks = true;

