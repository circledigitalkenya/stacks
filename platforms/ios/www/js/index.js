/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
      var db = window.sqlitePlugin.openDatabase("ladders", "1.0", "Demo", -1);
      db.transaction(function(tx){
        tx.executeSql('DROP TABLE IF EXISTS books');
        tx.executeSql('CREATE TABLE IF NOT EXISTS books (id integer primary key, isbn text, author text, title text)');

        tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0435905554","So Long a Letter","Mariama Ba")');
        tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0007189885","Purple Hibiscus","Chimamanda Ngozi Adichie")');
        tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0307961206","Dust","Yvonne Adhiambo Owuor")');
        tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0262620200","History and Class Consciousness: Studies in Marxist Dialectics","YGyorgy Lukacs")');

        tx.executeSql('SELECT isbn, author,title FROM books', [], function(tx, results){
          console.log(results.rows.length+': books found');
          var template = Handlebars.compile(
            $("#book-template").html()
          );

          var books = [];
          var len = results.rows.length;
          for (var i=0; i<len; i++){
            books.push({
              isbn : results.rows.item(i).isbn,
              author : results.rows.item(i).author,
              title : results.rows.item(i).title
            });
          }
          $('.book-list ul').empty().html(template({ books: books}));
          
        }, errorCB);

      },function(e) {
        console.log("ERROR: " + e.message);
      });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
       console.log('variable' + thisis);
    }
};

StatusBar.styleLightContent();

function  clickScan() {
    var scanner = cordova.require("com.phonegap.plugins.barcodescanner.barcodescanner");
       scanner.scan(
          function (result) {
              alert("We got a barcode\n" +
                    "Result: " + result.text + "\n" +
                    "Format: " + result.format + "\n" +
                    "Cancelled: " + result.cancelled);
          }, 
          function (error) {
              alert("Scanning failed: " + error);
          }
       );
}

// tansaction error callback
function errorCB(){
    console.log('error processing SQL: ' +err);
}

// Transaction success callback
function successCB() {
    console.log("success!");
}
