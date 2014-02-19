/*global module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch : {
          css : {
            files: ['www/sass/**'],
            tasks: ['shell:compass_compile'],
            options : {
              debounceDelay : 1000
            }            
          },
          app : {
            files: ['www/**'],
            tasks: ['shell:debug_ios'],
            options : {
              debounceDelay : 1000
            }            
          }
        },
        shell: {
          _options : {
            failOnError: true,
            stdout: true
          },
          compass_compile : {
            command : 'compass compile'
          },
          debug_ios : {
            command: 'cordova prepare ios'
          }
        },
    });   

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task
    grunt.registerTask('default', ['watch']);

};