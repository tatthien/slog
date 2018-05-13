---
title: Hello World
published: 10-05-2018
updated: 10-05-2018
excerpt: Why do I create this generator when the world has a lot of engine such as Hexo, Hugo, VuePress,...?
---
## About

Why do I create this generator when the world has a lot of engine such as Hexo, Hugo, VuePress,...?

I've tried many of them, but it was a mess for me when trying to config and customize theme. So I decided to create an own generator to hold the full control.

The letter `s` stands for **Static** and **Simple**. I just want to create a simple static site generator for my blog. Of course, I don't wan to compete with the existences.

You can check-out the demo here: [https://slog.tatthien.com/](https://slog.tatthien.com/)

## Usage

1. Clone this repository.
2. Create your content in markdown format inside the directories `posts` and `pages`.
3. `npm run build` or `yarn build` to build the static files.
4. The static files will be generated in the directory `public`.
5. Upload the `public` to your web host.

## Development

**Assets**

Watching the file changes:

`npm run asset:dev` or `yarn asset:dev`

Building the css, javascript:

`npm run asset:build` or `yarn asset:build`

**Preview**

There are two ways to preview the static content in `public`.

1. Just run `npm run server:start` or `yarn server:start`

2. Install package [https://github.com/indexzero/http-server](https://github.com/indexzero/http-server), go to `public` then run the command `http-server`.

## Deploying

**Your web host**

1. Run the command `npm run build` or `yarn build`
2. Upload the `public` to your web host.

**Netlify**

1. On Netlify, setup up a new project from GitHub with the following settings:

- Build command `npm run build` or `yarn build`
- Public direcetory `public/`

2. Hit the deploy button.
