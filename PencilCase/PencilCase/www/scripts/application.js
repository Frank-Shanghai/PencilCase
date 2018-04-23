define(["require", "exports", "./Utils"], function (require, exports, Utils) {
    // For an introduction to the Blank template, see the following documentation:
    // http://go.microsoft.com/fwlink/?LinkID=397705
    // To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
    // and then run "window.location.reload()" in the JavaScript Console.
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function initialize() {
        document.addEventListener('deviceready', onDeviceReady, false);
    }
    exports.initialize = initialize;
    function onDeviceReady() {
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        //var parentElement = document.getElementById('deviceready');
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');
        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');
        initializeDatabase();
    }
    function initializeDatabase() {
        var db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
        if (db) {
            db.transaction(function (transaction) {
                // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                //transaction.executeSql('DROP TABLE IF EXISTS Product', [], null, onDBError);
                transaction.executeSql('CREATE TABLE IF NOT EXISTS Product (\
                                        Id text primary key,\
                                        Name text not null, \
                                        Description text,\
                                        RetailPrice real not null,\
                                        RetailUnit text,\
                                        WholesalePrice real not null,\
                                        WholesaleUnit text,\
                                        ImportWholesalePrice real not  null,\
                                        ImportRetailPrice real not null,\
                                        Times integer not null,\
                                        Inventory integer not null,\
                                        Image,\
                                        CreatedDate datetime,\
                                        ModifiedDate datetime,\
                                        foreign key(RetailUnit) references UnitOfMeasure(Id),\
                                        foreign key(WholesaleUnit) references UnnitOfMeasure(Id)\
                                        )', [], null, onDBError);
                // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                //transaction.executeSql('drop table if exists UnitOfMeasure', [], null, onDBError);
                transaction.executeSql('create table if not exists UnitOfMeasure (Id text primary key, Name text not null, Description text)', [], null, onDBError);
            }, null, createTestData);
        }
        else {
            alert("Failed to open database.");
        }
    }
    // Just for testing, remove all function calls to it and this function
    function createTestData() {
        var db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
        if (db) {
            db.transaction(function (transaction) {
                transaction.executeSql('select Id from UnitOfMeasure', [], function (transaction, resultSet) {
                    if (resultSet.rows.length === 0) {
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '个')", [], null, onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '筒')", [], null, onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '箱')", [], null, onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '件')", [], null, onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '块')", [], null, onDBError);
                    }
                }, onDBError);
            });
        }
        else {
            alert("Failed to open database.");
        }
    }
    function onDBError(transaction, sqlError) {
        alert(sqlError.message);
    }
    function onError() {
        alert("Error happened.");
    }
    exports.onError = onError;
    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }
    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
});
//# sourceMappingURL=application.js.map