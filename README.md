# open-claw-clone-cli

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

To use command forgecli using terminal:

Add this code to package.json file

```c
"bin": {
    "forgecli": "./index.ts"
  }
```
then run:

```bash
bun link
bun link forgecli
```