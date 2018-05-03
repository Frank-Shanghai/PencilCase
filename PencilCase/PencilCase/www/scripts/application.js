define(["require", "exports", "./Utils", "./Pages/HomePage", "./Navigator"], function (require, exports, Utils, HomePage_1, Navigator_1) {
    // For an introduction to the Blank template, see the following documentation:
    // http://go.microsoft.com/fwlink/?LinkID=397705
    // To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
    // and then run "window.location.reload()" in the JavaScript Console.
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Application = (function () {
        function Application() {
            var _this = this;
            this.activePage = ko.observable(null);
            this.pages = [];
            this.confirmDialog = ko.observable(null);
            this.onDeviceReady = function () {
                document.addEventListener('pause', _this.onPause, false);
                document.addEventListener('resume', _this.onResume, false);
                ko.applyBindings(Application.instance, document.documentElement);
                Navigator_1.Navigator.instance.initialize();
                // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
                //var parentElement = document.getElementById('deviceready');
                //var listeningElement = parentElement.querySelector('.listening');
                //var receivedElement = parentElement.querySelector('.received');
                //listeningElement.setAttribute('style', 'display:none;');
                //receivedElement.setAttribute('style', 'display:block;');
                _this.initializeDatabase();
            };
            // Just for testing, remove all function calls to it and this function
            this.initializeDatabase = function () {
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
                    }, null, _this.createTestData);
                }
                else {
                    alert("Failed to open database.");
                }
            };
            this.createTestData = function () {
                var db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
                if (db) {
                    db.transaction(function (transaction) {
                        transaction.executeSql('select Id from UnitOfMeasure', [], function (transaction, resultSet) {
                            if (resultSet.rows.length === 0) {
                                var guidGe = Utils.guid();
                                var guidXiang = Utils.guid();
                                var guidKuai = Utils.guid();
                                var guidJian = Utils.guid();
                                transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + guidGe + "', '个')", [], null, _this.onDBError);
                                transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '筒')", [], null, _this.onDBError);
                                transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + guidXiang + "', '箱')", [], null, _this.onDBError);
                                transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + guidJian + "', '件')", [], null, _this.onDBError);
                                transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + guidKuai + "', '块')", [], null, _this.onDBError);
                                var clearStatement = "delete from Product";
                                // 箱， 个
                                var sqlStatement = "insert into Product values ('" + Utils.guid() + "', 'Product1', 'Product description ....', 1.5, '" + guidGe + "', 28, '" + guidXiang + "', 24, 1, 24, 9999, null, '4/25/2018', '4/25/2018')";
                                var sqlStatement1 = "insert into Product values ('" + Utils.guid() + "', '可爱多', 'Product description ....', 6, '" + guidGe + "', 68, '" + guidXiang + "', 60, 5, 12, 9999, null, '4/25/2018', '4/25/2018')";
                                var sqlStatement2 = "insert into Product values ('" + Utils.guid() + "', '东北大板', 'Product description ....', 6, '" + guidKuai + "', 68, '" + guidJian + "', 60, 5, 12, 9999, null, '4/25/2018', '4/25/2018')";
                                transaction.executeSql(clearStatement, [], null, _this.onDBError);
                                transaction.executeSql(sqlStatement, [], null, _this.onDBError);
                                transaction.executeSql(sqlStatement1, [], null, _this.onDBError);
                                transaction.executeSql(sqlStatement2, [], null, _this.onDBError);
                            }
                        }, _this.onDBError);
                    });
                }
                else {
                    alert("Failed to open database.");
                }
            };
            this.onDBError = function (transaction, sqlError) {
                alert(sqlError.message);
            };
            this.onApplicationError = function () {
                alert("Application Error happened.");
            };
            this.onPause = function () {
                // TODO: This application has been suspended. Save application state here.
            };
            this.onResume = function () {
                // TODO: This application has been reactivated. Restore application state here.
            };
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
            this.activePage(homePage);
            this.homePage = ko.observable(homePage);
        };
        Application.prototype.initialize = function () {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        };
        return Application;
    }());
    exports.Application = Application;
});
//# sourceMappingURL=application.js.map