import { Command } from 'commander'
import { createCreateCommand } from './commands/create'
import { createAddCommand } from './commands/add'
import { createPlaygroundCommand } from './commands/playground'
import { createGenerateCommand } from './commands/generate'
import { CLI_VERSION, CLI_NAME } from './constants'

const program = new Command()

program.name(CLI_NAME).description('CLI tooling for Tigercat UI library').version(CLI_VERSION)

program.addCommand(createCreateCommand())
program.addCommand(createAddCommand())
program.addCommand(createPlaygroundCommand())
program.addCommand(createGenerateCommand())

program.parse()
