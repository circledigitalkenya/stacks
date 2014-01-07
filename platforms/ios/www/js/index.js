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
        console.log('stupid piece of crap');

        //plugin here https://github.com/lite4cordova/Cordova-SQLitePlugin
        //forum here 
         var db = window.sqlitePlugin.openDatabase("Database", "1.0", "Demo", -1);

        db.transaction(function(tx) {
          tx.executeSql('DROP TABLE IF EXISTS test_table');
          tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id integer primary key, name text, data_num integer)');

          tx.executeSql("INSERT INTO test_table (name, data_num) VALUES (?,?)", ["Bob", 456], function(tx, res) {
          console.log("insertId: " + res.insertId + " -- probably 1"); // check #18/#38 is fixed
          // alert("insertId: " + res.insertId + " -- should be valid");

            db.transaction(function(tx) {
              tx.executeSql("SELECT data_num, name from test_table;", [], function(tx, res) {
                console.log("res.rows.length: " + res.rows.item(0).data_num + " -- should be 456");
                thisis = res.rows.item(0).name;
                alert(JSON.stringify(res.rows.item(0))); 
                
                document.getElementById('database').innerHTML = thisis;
                // alert(document.getElementByID('database').innerHTML);
                // alert("res.rows.item(0).data_num: " + res.rows.item(1).data_num + " -- should be 456");
              });
            });

          }, function(e) {
            console.log("ERROR: " + e.message);
          });
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