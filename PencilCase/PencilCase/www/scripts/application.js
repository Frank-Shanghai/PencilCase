define(["require", "exports", "./Utils", "./Pages/HomePage"], function (require, exports, Utils, HomePage_1) {
    // For an introduction to the Blank template, see the following documentation:
    // http://go.microsoft.com/fwlink/?LinkID=397705
    // To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
    // and then run "window.location.reload()" in the JavaScript Console.
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Application = (function () {
        function Application() {
            this.activePage = ko.observable(null);
            this.pages = [];
            this.openHomePage();
        }
        Object.defineProperty(Application, "instance", {
            get: function () {
                if (Application._instance == null) {
                    Application._instance = new Application();
                }
                return Application._instance;
            },
            enumerable: true,
            configurable: true
        });
        Application.prototype.openHomePage = function () {
            var homePage = new HomePage_1.HomePage();
            this.pages.push(homePage);
            this.activePage(homePage);
        };
        Application.prototype.initialize = function () {
            ko.applyBindings(Application.instance, document.documentElement);
            document.addEventListener('deviceready', this.onDeviceReady, false);
        };
        Application.prototype.onDeviceReady = function () {
            document.addEventListener('pause', this.onPause, false);
            document.addEventListener('resume', this.onResume, false);
            // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
            //var parentElement = document.getElementById('deviceready');
            //var listeningElement = parentElement.querySelector('.listening');
            //var receivedElement = parentElement.querySelector('.received');
            //listeningElement.setAttribute('style', 'display:none;');
            //receivedElement.setAttribute('style', 'display:block;');
            this.initializeDatabase();
        };
        // Just for testing, remove all function calls to it and this function
        Application.prototype.initializeDatabase = function () {
            var _this = this;
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
                                        )', [], null, _this.onDBError);
                    // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                    //transaction.executeSql('drop table if exists UnitOfMeasure', [], null, onDBError);
                    transaction.executeSql('create table if not exists UnitOfMeasure (Id text primary key, Name text not null, Description text)', [], null, _this.onDBError);
                }, null, this.createTestData);
            }
            else {
                alert("Failed to open database.");
            }
        };
        Application.prototype.createTestData = function () {
            var _this = this;
            var db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
            if (db) {
                db.transaction(function (transaction) {
                    transaction.executeSql('select Id from UnitOfMeasure', [], function (transaction, resultSet) {
                        if (resultSet.rows.length === 0) {
                            transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '个')", [], null, _this.onDBError);
                            transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '筒')", [], null, _this.onDBError);
                            transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '箱')", [], null, _this.onDBError);
                            transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '件')", [], null, _this.onDBError);
                            transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '块')", [], null, _this.onDBError);
                        }
                    }, _this.onDBError);
                });
            }
            else {
                alert("Failed to open database.");
            }
        };
        Application.prototype.onDBError = function (transaction, sqlError) {
            alert(sqlError.message);
        };
        Application.prototype.onApplicationError = function () {
            alert("Application Error happened.");
        };
        Application.prototype.onPause = function () {
            // TODO: This application has been suspended. Save application state here.
        };
        Application.prototype.onResume = function () {
            // TODO: This application has been reactivated. Restore application state here.
        };
        return Application;
    }());
    exports.Application = Application;
});
//# sourceMappingURL=application.js.map