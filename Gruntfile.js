/*global module:false*/
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
          files: [
            '<%= jshint.files %>'
          ],
          tasks: ['jshint'{% if (min_concat) { %}, 'concat', 'min'{% } %}]
        },
        shell: {
          _options: {
            failOnError: true,
            stdout: true
          },
          debug_ios: {
            command: 'cordova build ios'
          }
        },
    })    

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Custom tasks
    grunt.registerTask('debug','Create a debug build', function(platform) {
    grunt.task.run('shell:debug_' + platform);
    });

    // Default task
    grunt.registerTask('default');

};