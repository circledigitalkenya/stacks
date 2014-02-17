/*global module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
          files: [
            'www/**'
          ],
          tasks: ['compass','shell']
        },
        compass: {                  // Task
          dev: {                   // Target
            options: {              // Target options
              sassDir: 'www/sass',
              cssDir: 'www/stylesheets',
              environment: 'development'
            }
          }
        },
        shell: {
          _options: {
            failOnError: true,
            stdout: true
          },
          debug_ios: {
            command: 'cordova prepare ios'
          }
        },
    });   

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');

    // Default task
    grunt.registerTask('default', ['watch']);

};