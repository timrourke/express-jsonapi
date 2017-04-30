'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    copy: {
      main: {
        expand: true,
        cwd: 'src/',
        src: ['**/!(*.ts)'],
        dest: 'dist',
        filter: 'isFile',
      }
    },
    ts: {
      app: {
        files: [{
          src: ["src/\*\*/\*.ts", "!src/.baseDir.ts"],
          dest: "./dist"
        }],
        options: {
          module: "commonjs",
          target: "es6",
          sourceMap: true,
          lib: ['es6'],
          fast: 'never'
        }
      }
    },
    tslint: {
      options: {
        configuration: grunt.file.readJSON('tslint.json')
      },
      all: {
        src: ["src/\*\*/\*.ts", "!src/.baseDir.ts"],
      }
    },
    watch: {
      ts: {
        files: [
          "src/\*\*/\*.*"
        ],
        tasks: ["newer:tslint:all", "ts", "copy"],
        options: {
          spawn: false
        }
      },
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks("grunt-newer");

  grunt.registerTask("default", [
    "tslint:all", "ts", "copy"
  ]);

  grunt.registerTask("watch", [
    "tslint:all", "ts", "copy", "watch"
  ]);

};
