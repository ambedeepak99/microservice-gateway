module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [
                    'app.js', // All JS in the libs folder
//                    'app/*.js'  // This specific file
                ],
                dest: 'production.js'
            }
        },
        uglify: {
            build: {
                src: 'production.js',
                dest: 'index.js'
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path
//                    {expand: true, src: ['script/*'], dest: 'deployed/script/', filter: 'isFile'},
                    // makes all src relative to cwd
//                    {expand: true, cwd: 'script/', src: ['**'], dest: 'deployed/script/'},
                    // flattens results to a single level
//                    {expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'},

                    // includes files within path and its sub-directories
                    //{expand: true, src: ['package.json'], dest: 'ms_gateway/'},
                    // includes files within path and its sub-directories
                    //{expand: true, src: ['readme.md'], dest: 'ms_gateway/'},
                    // includes files within path and its sub-directories
                    //{expand: true, src: ['.npmignore'], dest: 'ms_gateway/'},
                    //{expand: true, src: ['.gitignore'], dest: 'ms_gateway/'},
                    //{expand: true, src: ['index.js'], dest: 'ms_gateway/'},
                ]
            }
        },
        watch: {
            options: {
            },
            scripts: {
                files: ['app.js'],
                tasks: ['concat', 'uglify'],
                options: {
//                    spawn: false,
                    livereload: true
                }
            },
            script: {
                files: ['package.json','readme.md'],
                tasks: ['copy'],
                options: {
//                    spawn: false,
                    livereload: true
                }
            }
        }
    });
    // grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-contrib-cssmin');
    // grunt.loadNpmTasks('grunt-contrib-less');
    // grunt.loadNpmTasks('less-plugin-autoprefix');
    // grunt.loadNpmTasks('less-plugin-clean-css');
    // grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
//    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['concat', 'uglify','copy']);// 'less', 'concat_css', 'cssmin', 'htmlmin', 'imagemin',
};
