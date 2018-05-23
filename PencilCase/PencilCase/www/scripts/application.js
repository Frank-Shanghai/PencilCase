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
            this.isDataLoaded = ko.observable(false);
            this.openDataBase = function () {
                if (_this.db) {
                    return _this.db;
                }
                else {
                    _this.db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
                    if (_this.db)
                        return _this.db;
                    return null;
                }
            };
            this.onDeviceReady = function () {
                var firstPageUrl = window.location.href;
                document.addEventListener('pause', _this.onPause, false);
                document.addEventListener('resume', _this.onResume, false);
                document.addEventListener('backbutton', function (evt) {
                    if (cordova.platformId !== 'android') {
                        return;
                    }
                    if (!Application.instance.confirmDialog()) {
                        if (Application.instance.activePage().back)
                            Application.instance.activePage().back();
                    }
                    else {
                        Application.instance.confirmDialog(null);
                        window.history.back();
                    }
                }, false);
                ko.applyBindings(Application.instance, document.documentElement);
                _this.enableFilterableSelect();
                Navigator_1.Navigator.instance.initialize();
                // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
                //var parentElement = document.getElementById('deviceready');
                //var listeningElement = parentElement.querySelector('.listening');
                //var receivedElement = parentElement.querySelector('.received');
                //listeningElement.setAttribute('style', 'display:none;');
                //receivedElement.setAttribute('style', 'display:block;');
                _this.initializeDatabase();
            };
            this.enableFilterableSelect = function () {
                var pageIsSelectmenuDialog = function (page) {
                    var isDialog = false, id = page && page.attr("id");
                    $(".filterable-select").each(function () {
                        if ($(this).attr("id") + "-dialog" === id) {
                            isDialog = true;
                            return false;
                        }
                    });
                    return isDialog;
                };
                $.mobile.document
                    .on("selectmenucreate", ".filterable-select", function (event) {
                    var input, selectmenu = $(event.target), list = $("#" + selectmenu.attr("id") + "-menu"), form = list.jqmData("filter-form");
                    // We store the generated form in a variable attached to the popup so we avoid creating a
                    // second form/input field when the listview is destroyed/rebuilt during a refresh.
                    if (!form) {
                        input = $("<input data-type='search'></input>");
                        form = $("<form></form>").append(input);
                        input.textinput();
                        list
                            .before(form)
                            .jqmData("filter-form", form);
                        form.jqmData("listview", list);
                    }
                    // Instantiate a filterable widget on the newly created selectmenu widget and indicate that
                    // the generated input form element is to be used for the filtering.
                    selectmenu
                        .filterable({
                        input: input,
                        children: "> option[value]"
                    })
                        .on("filterablefilter", function () {
                        selectmenu.selectmenu("refresh");
                    });
                })
                    .on("pagecontainerbeforeshow", function (event, data) {
                    var listview, form;
                    // We only handle the appearance of a dialog generated by a filterable selectmenu
                    if (!pageIsSelectmenuDialog(data.toPage)) {
                        return;
                    }
                    listview = data.toPage.find("ul");
                    form = listview.jqmData("filter-form");
                    // Attach a reference to the listview as a data item to the dialog, because during the
                    // pagecontainerhide handler below the selectmenu widget will already have returned the
                    // listview to the popup, so we won't be able to find it inside the dialog with a selector.
                    data.toPage.jqmData("listview", listview);
                    // Place the form before the listview in the dialog.
                    listview.before(form);
                })
                    .on("pagecontainerhide", function (event, data) {
                    var listview, form;
                    // We only handle the disappearance of a dialog generated by a filterable selectmenu
                    if (!pageIsSelectmenuDialog(data.toPage)) {
                        return;
                    }
                    listview = data.prevPage.jqmData("listview"),
                        form = listview.jqmData("filter-form");
                    // Put the form back in the popup. It goes ahead of the listview.
                    listview.before(form);
                });
            };
            // Just for testing, remove all function calls to it and this function
            this.initializeDatabase = function () {
                var db = _this.openDataBase();
                if (db) {
                    db.transaction(function (transaction) {
                        // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                        //transaction.executeSql('drop table if exists UnitOfMeasure', [], null, this.onDBError);
                        transaction.executeSql('create table if not exists UnitOfMeasure (Id text primary key, Name text not null, Description text)', [], null, _this.onDBError);
                        // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                        //transaction.executeSql('DROP TABLE IF EXISTS Product', [], null, this.onDBError);
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
                                        WholesaleCost real not  null,\
                                        RetailCost real not null,\
                                        Times integer not null,\
                                        Inventory integer not null,\
                                        Image,\
                                        CreatedDate datetime,\
                                        ModifiedDate datetime,\
                                        foreign key(RetailUnit) references UnitOfMeasure(Id),\
                                        foreign key(WholesaleUnit) references UnitOfMeasure(Id)\
                                        )', [], null, _this.onDBError);
                        // I have to name the table as Orders instead of Order, because Order is a reserved word by SQL Lite, it did took me some time
                        // https://www.sqlite.org/lang_keywords.html
                        //transaction.executeSql('DROP TABLE IF EXISTS Orders', [], null, this.onDBError);
                        transaction.executeSql('CREATE TABLE IF NOT EXISTS Orders (\
                                        Id text primary key not null,\
                                        BatchId text not null,\
                                        ProductId text not null, \
                                        Type int,\
                                        Unit text not null,\
                                        Price real not null,\
                                        Quantity real,\
                                        Total real not null,\
                                        CreatedDate datetime, \
                                        ModifiedDate datetime,\
                                        foreign key(Unit) references UnitOfMeasure(Id),\
                                        foreign key(ProductId) references Product(Id)\
                                        )', [], null, _this.onDBError);
                    }, null, _this.createTestData);
                }
                else {
                    alert("Failed to open database.");
                }
            };
            this.createTestData = function () {
                var db = _this.openDataBase();
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
                                var sqlStatement = "insert into Product values ('" + Utils.guid() + "', 'Product1', 'Product description ....', 1.5, '" + guidGe + "', 28, '" + guidXiang + "', 0, 0, 0, 0, 24, 0, null, '4/25/2018', '4/25/2018')";
                                var sqlStatement1 = "insert into Product values ('" + Utils.guid() + "', '可爱多', 'Product description ....', 6, '" + guidGe + "', 68, '" + guidXiang + "', 0, 0, 0, 0, 12, 0, null, '4/25/2018', '4/25/2018')";
                                var sqlStatement2 = "insert into Product values ('" + Utils.guid() + "', '东北大板', 'Product description ....', 6, '" + guidKuai + "', 68, '" + guidJian + "', 0, 0, 0, 0, 12, 0, null, '4/25/2018', '4/25/2018')";
                                var sqlStatement3 = "insert into Product values ('" + Utils.guid() + "', '随变', 'Product description ....', 6, '" + guidGe + "', 68, '" + guidXiang + "', 0, 0, 0, 0, 12, 0, null, '4/25/2018', '4/25/2018')";
                                var sqlStatement4 = "insert into Product values ('" + Utils.guid() + "', '光明', 'Product description ....', 6, '" + guidKuai + "', 68, '" + guidJian + "', 0, 0, 0, 0, 12, 0, null, '4/25/2018', '4/25/2018')";
                                transaction.executeSql(clearStatement, [], null, _this.onDBError);
                                transaction.executeSql(sqlStatement, [], null, _this.onDBError);
                                transaction.executeSql(sqlStatement1, [], null, _this.onDBError);
                                transaction.executeSql(sqlStatement2, [], null, _this.onDBError);
                                transaction.executeSql(sqlStatement3, [], null, _this.onDBError);
                                transaction.executeSql(sqlStatement4, [], null, _this.onDBError);
                            }
                        }, _this.onDBError);
                    }, function () {
                        alert("Failed to initialize data.");
                    }, function () {
                        _this.isDataLoaded(true);
                    });
                }
                else {
                    alert("Failed to open database.");
                }
            };
            this.onDBError = function (transaction, sqlError, customMessage) {
                var errorMessage = sqlError.message;
                if (customMessage) {
                    errorMessage = "User Message: " + customMessage + "\r\n" + errorMessage;
                }
                alert(errorMessage);
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