#!/usr/bin/env node

'use strict';

var pkg = require('../package.json'),
    raml4js = require('../lib/raml4js');

var fs = require('fs'),
    minimist = require('minimist');

var argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
    c: 'classname'
  },
  string: ['classname'],
  boolean: ['help', 'version']
});

var exit = process.exit.bind(process);

function isFile(filepath) {
  return fs.existsSync(filepath) && fs.statSync(filepath).isFile();
}

function writeln(message, error) {
  process[error ? 'stderr' : 'stdout'].write(message + '\n');
}

function usage(header) {
  var message = [];

  if (header) {
    message.push(header);
  }

  message.push('Usage:');
  message.push('  raml4js src/index.raml [OPTIONS] > output.js');

  message.push('\nOptions:');
  message.push('  -c, --classname    Custom className for client object');

  return message.join('\n');
}

if (argv.version) {
  writeln([pkg.name, pkg.version].join(' '));
  exit(1);
} else if (argv.help) {
  writeln(usage());
  exit(1);
} else {
  var input_file = argv._.shift();

  if (!input_file) {
    writeln(usage('Missing arguments'), true);
    exit(1);
  }

  if (!isFile(input_file)) {
    writeln(usage('Invalid input'), true);
    exit(1);
  }

  raml4js(input_file, function(err, data) {
    if (err) {
      writeln(err.toString(), true);
      exit(1);
    }

    try {
      writeln('module.exports = ' + raml4js.client(data, argv.classname).toString() + ';');
    } catch (e) {
      writeln(e.message);
      exit(1);
    }
  });
}
