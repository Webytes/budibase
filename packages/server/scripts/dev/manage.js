#!/usr/bin/env node
const compose = require("docker-compose")
const path = require("path")
const fs = require("fs")

// This script wraps docker-compose allowing you to manage your dev infrastructure with simple commands.
const CONFIG = {
  cwd: path.resolve(process.cwd(), "../../hosting"),
  config: "docker-compose.dev.yaml",
  log: true,
}

const Commands = {
  Up: "up",
  Down: "down",
  Nuke: "nuke",
}

async function init() {
  const envFilePath = path.join(process.cwd(), ".env")
  if (fs.existsSync(envFilePath)) {
    return
  }
  const envFileJson = {
    PORT: 4001,
    MINIO_URL: "http://localhost:10000/",
    COUCH_DB_URL: "http://budibase:budibase@localhost:10000/db/",
    WORKER_URL: "http://localhost:4002",
    JWT_SECRET: "testsecret",
    MINIO_ACCESS_KEY: "budibase",
    MINIO_SECRET_KEY: "budibase",
    COUCH_DB_PASSWORD: "budibase",
    COUCH_DB_USER: "budibase",
    SELF_HOSTED: 1,
  }
  let envFile = ""
  Object.keys(envFileJson).forEach(key => {
    envFile += `${key}=${envFileJson[key]}\n`
  })
  fs.writeFileSync(envFilePath, envFile)
}

async function up() {
  console.log("Spinning up your budibase dev environment... 🔧✨")
  await init()
  await compose.upAll(CONFIG)
}

async function down() {
  console.log("Spinning down your budibase dev environment... 🌇")
  await compose.stop(CONFIG)
}

async function nuke() {
  console.log(
    "Clearing down your budibase dev environment, including all containers and volumes... 💥"
  )
  await compose.down(CONFIG)
}

const managementCommand = process.argv.slice(2)[0]

if (
  !managementCommand ||
  !Object.values(Commands).some(command => managementCommand === command)
) {
  throw new Error(
    "You must supply either an 'up', 'down' or 'nuke' commmand to manage the budibase development environment."
  )
}

let command
switch (managementCommand) {
  case Commands.Up:
    command = up
    break
  case Commands.Down:
    command = down
    break
  case Commands.Nuke:
    command = nuke
    break
  default:
    command = up
}

command()
  .then(() => {
    console.log("Done! 🎉")
  })
  .catch(err => {
    console.error(
      "Something went wrong while managing budibase dev environment:",
      err.message
    )
  })
