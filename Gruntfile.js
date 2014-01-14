/*global module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
          files: [
            'www/**'
          ],
          tasks: ['shell']
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

    // Default task
    grunt.registerTask('default', ['watch']);

};